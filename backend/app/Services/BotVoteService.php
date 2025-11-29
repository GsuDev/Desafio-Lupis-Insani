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
     * Método PRINCIPAL.
     * Recibe los votos actuales y añade los votos de los bots.
     *
     * @param Collection $currentVotes  Votos realizados por humanos hasta el momento.
     * @param int        $gameId        ID de la partida.
     * @param string     $phase         'day' o 'night'.
     * @return Collection               Colección extendida (Votos humanos + Votos bots).
     */
    public function applyBotVotes(Collection $currentVotes, int $gameId, string $phase): Collection
    {
        // TODO: 1. Obtener bots vivos que pueden votar según la fase.
        
        // TODO: 2. Calcular ranking de votos actuales.
        
        // TODO: 3. Obtener matriz de probabilidades (usando la calculadora).
        
        // TODO: 4. Generar votos falsos para cada bot.
        
        // Por ahora devolvemos lo mismo que entró para que no rompa nada.
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
     * Decide a quién va a votar un bot específico basándose en las probabilidades.
     * Aquí aplicaremos la ruleta aleatoria.
     */
    private function selectTarget(array $probabilities, participant $bot): ?int
    {
        return null; // Retorno vacío temporal
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
}