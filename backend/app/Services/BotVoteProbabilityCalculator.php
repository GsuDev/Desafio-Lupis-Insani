<?php

namespace App\Services;

class BotVoteProbabilityCalculator
{
    /**
     * Calcula qué porcentaje de probabilidad tiene cada candidato de recibir un voto.
     *
     * @param array $votedParticipants Lista de los que ya tienen votos 
     * Viene ordenada: el primero es el que más votos tiene
     * @param array $allParticipants   Lista de todos los IDs de jugadores vivos
     * @param float $dispersion        Un número del 0.0 al 1.0
     * 0.0 = Los bots (votan a lo mismo)
     * 1.0 = Los bots (consideran a todos)
     *
     * @return array<int, float>       Devuelve [ID_JUGADOR => PORCENTAJE]. Ej: [1 => 0.50, 2 => 0.30...]
     */
    public function calculateProbabilities(array $votedParticipants, array $allParticipants, float $dispersion): array
    {
        // PASO 1: Separar a los ya votados de los otros sin votos
        
        // Sacamos solo los IDs de la lista de votados.
        $votedIds = array_column($votedParticipants, 'id');

        // se calcula  son los que no tienen votos y restmos todos - populares
        $otherIds = array_values(array_diff($allParticipants, $votedIds));

        // PASO 2: Decidir a cuántos de los otro invitamos a la votación
        // Aquí usamos la dispersión.
        // Si dispersión es 0.0, no invitamos a nadie nuevo
        // Si dispersión es 1.0, invitamos a todos los que faltaban
        $othersCountToAdd = (int) round(count($otherIds) * $dispersion);

        // PASO 3: Crear la lista final de candidatos.
        // Siempre ponemos primero a los Populares para respetar su ranking
        // y luego añadimos a los otros que hemos calculado arriba.
        $candidates = array_merge($votedIds, array_slice($otherIds, 0, $othersCountToAdd));

        // si la lista está vacia nos vamos
        $count = count($candidates);
        if ($count === 0) {
            return [];
        }

        // PASO 4: Repartir la probabilidad el sistema de puntos
        // Al primero de la lista le damos muchos puntos y al ultimo le damos un puntos
        // Fórmula matemática para saber cuántos puntos hay en total (Ej: 3+2+1 = 6).
        $sumOfWeights = ($count * ($count + 1)) / 2;

        $probabilities = [];

        foreach ($candidates as $index => $participantId) {
            // se asignan los puntos
            // Si hay 3 candidatos: El 1º se lleva 3 puntos, el 2º lleva 2, el 3º lleva 1.
            $weight = $count - $index;

            // se calcula el porcentaje real Puntos / Total.
            // Usamos round(..., 4) para que quede bonito (ej: 0.3333).
            $probabilities[$participantId] = round($weight / $sumOfWeights, 4);
        }

        return $probabilities;
    }
}