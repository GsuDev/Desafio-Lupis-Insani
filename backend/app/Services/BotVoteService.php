<?php

namespace App\Services;

use App\Models\participant; 
use App\Models\Vote;
use Illuminate\Support\Collection;

class BotVoteService
{
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
}