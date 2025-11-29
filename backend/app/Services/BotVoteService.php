<?php

namespace App\Services;

use App\Models\participant; 
use App\Models\Vote;
use Illuminate\Support\Collection;

class BotVoteService
{

    private const WEREWOLF_CHARACTER_ID = 2;
    /**
     * Instancia nuestro calculadora
     */
    protected BotVoteProbabilityCalculator $calculator;

    /**
     * 
     * Laravel inyectará automáticamente la calculadora aquí.
     */
    public function __construct(BotVoteProbabilityCalculator $calculator)
    {
        $this->calculator = $calculator;
    }

    /**
     * Método PRINCIPAL: Orquesta la votación de los bots.
     *
     * @param Collection $currentVotes  Votos humanos ya emitidos (Input de HU25).
     * @param int        $gameId        ID de la partida.
     * @param string     $phase         'day' o 'night'.
     * @param int        $cycle         Número de día/turno (corresponde a day_number).
     * @return Collection               Colección extendida (Humanos + Bots).
     */
    public function applyBotVotes(Collection $currentVotes, int $gameId, string $phase, int $cycle): Collection
    {
        
        // Leemos la dispersión del .env. si no existe, usamos 0.5 por default
        $dispersion = (float) env('BOT_VOTE_DISPERSION', 0.5);

        // Necesitamos saber cómo va la votación ahora para calcular probabilidades
        // Transformamos la colección de votos en el formato que pide nuestra calculadora:
        // [['id' => 5, 'votes' => 2], ['id' => 8, 'votes' => 1]...]
        
        // Agrupamos por el ID del votado (target_id) y contamos.
        $votedParticipants = $currentVotes->groupBy('target_id')
            ->map(function ($votes, $targetId) {
                return ['id' => $targetId, 'votes' => count($votes)];
            })
            ->sortByDesc('votes') //el mas votado primero
            ->values()            // Re-indexamos para quitar claves raras
            ->toArray();

        // tambien necesitamos la lista de todos los vivos para saber quiénes son los otros
        // pluck('id') nos da solo los números y los ponemos en un array bonito
        $allAliveIds = participant::where('game_id', $gameId)->alive()->pluck('id')->toArray();

        // ahora se calculan las probabilidades globales
        // la calculadora que se hizo nos muestra las probabilidades de nuestro candidato
        $globalProbabilities = $this->calculator->calculateProbabilities(
            $votedParticipants, 
            $allAliveIds, 
            $dispersion
        );

        // se obtienen los bots que van a votar
        $bots = $this->getEligibleBots($gameId, $phase);

        // ahora se inyectan los votos
        foreach ($bots as $bot) {
            
            // filtramos a quienes no pueden votar este bot en especifico
            // quita su propio id o id de los otros lobos
            $validCandidates = $this->excludeCandidates($allAliveIds, $bot, $phase);

            // se ajustan las probabilidades:
            
           
            $botProbabilities = [];

            
            foreach ($globalProbabilities as $candidateId => $probability) {
                
                // Comprobamos si este candidato está en la lista de válidos
                if (in_array($candidateId, $validCandidates)) {
                    
                    $botProbabilities[$candidateId] = $probability;
                }
            }
            // buscamos el objetivo
            $targetId = $this->selectTarget($botProbabilities);

            //TODO:VICTOR
            //se crea el Voto en memoria no persiste en bbdd
            // Usamos $cycle para rellenar 'day_number'.
            // se usa  la comparación ($phase === 'day') para rellenar 'is_day'.
            $botVote = new Vote([
                'game_id'        => $gameId,
                'voter_id'       => $bot->id, 
                'target_id'      => $targetId,
                'is_day'         => ($phase === 'day'),
                'day_number'     => $cycle,
            ]);

            
            $currentVotes->push($botVote);
        }

        
        return $currentVotes;
    }

    /**
     * Filtra que bots tienen derecho a votar en esta fase
     * - Día: Todos los bots vivos de la partida.
     * - Noche: Solo los bots vivos que sean LOBOS.
     */
    private function getEligibleBots(int $gameId, string $phase): Collection
    {
        // 1. Empezamos la consulta: Queremos participantes de esta partida
        $query = participant::where('game_id', $gameId)
            ->where('is_bot', true) // Solo bots
            ->alive();              // Solo vivos 

        // 2. Regla de la Noche:
        // Si es de noche, aplicamos un filtro extra: solo pasan los lobos
        if ($phase === 'night') {
            $query->werewolves();   
        }

        // 3. Ejecutamos la consulta y devolvemos la colección.
        return $query->get();
    }


    /**
     * Filtra la lista de candidatos excluyendo a los que el bot no puede votar.
     * * @param array       $candidateIds  Lista de IDs de todos los participantes vivos.
     * @param participant $bot           El bot que está intentando votar.
     * @param string      $phase         Fase actual ('day' o 'night').
     * @return array                     Lista final de IDs válidos para votar.
     */
    private function excludeCandidates(array $candidateIds, participant $bot, string $phase): array
    {
        // regla general: está prohibido autovotarse 
        // se quita el id del propio bots de la lista
        // array_diff devuelve los valores del array 1 que no están en el array 2
        $validCandidates = array_diff($candidateIds, [$bot->id]);

        // regla de la noche: los lobos no se atacan entre si
        // solo aplica si es de noche y el bot actual es lobo
        if ($phase === 'night' && $bot->character_id === self::WEREWOLF_CHARACTER_ID) {
            
            // se obtienen los id de todos los compañeros lobo
            // se usa el scope que se creo antes
            $werewolfIds = participant::werewolves()->pluck('id')->toArray();

            // se quitan de las listas de las posibles victimas
            $validCandidates = array_diff($validCandidates, $werewolfIds);
        }

        // Re-indexamos el array (array_values) para que los índices sean 0, 1, 2... 
        // y no queden huecos como 0, 3, 5... (esto evita bugs al iterar después)
        return array_values($validCandidates);
    }

    /**
     * Elige a la víctima usando una "Ruleta Rusa" de probabilidades.
     * Recibo un array tipo: [ID_JUGADOR => PROBABILIDAD]. Ej: [5 => 0.20, 8 => 0.80]
     */
    private function selectTarget(array $probabilities): ?int
    {
        // se genero un número aleatorio entre 0.0 y 1.0
        // mt_rand() da un entero gigante al dividirlo por el máximo posible me da el decimal
        $randomValue = mt_rand() / mt_getrandmax();

        $accumulator = 0.0;

        // se recorro los candidatos sumando sus probabilidades
        foreach ($probabilities as $candidateId => $probability) {
            $accumulator += $probability;

            // Si mi número aleatorio (la bola) cae dentro del rango acumulado actual,
            // significa que ha caído en la casilla de este candidato.
            if ($randomValue <= $accumulator) {
                return $candidateId; 
            }
        }

        //esto es un salvaguardas
        // A veces la suma de decimales en informática no da exacto
        // Si el bucle termina sin elegir a nadie por ese error milimétrico
        // devolvemos el último candidato de la lista para no romper el juego
        //no se va a dar el caso espero pdro por si acaso
        return array_key_last($probabilities);
    }
}