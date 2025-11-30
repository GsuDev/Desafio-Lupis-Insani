<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Votation;
use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    // Este metodo se completara en otra hu
    public function registerVote(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|integer|exists:games,id',
            'voter_id' => 'required|integer|exists:participants,id',
            'target_id' => 'required|integer|exists:participants,id',
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer|min:1',
        ]);

        // $vote = Vote::create($validated);
        // Busco la votación activa o la creo si es el primer voto del turno
        // busca una votación con ese game/fase/dia.
        $votation = Votation::firstOrCreate(
            [
                'game_id' => $validated['game_id'],
                'is_day' => $validated['is_day'],
                'day_number' => $validated['day_number'],
            ],
            [
                'is_closed' => false, // Si la crea nueva, nace abierta
            ]
        );

        // Comprobacion de seguridad: ¿Está cerrada la votación?
        if ($votation->is_closed) {
            return response()->json([
                'success' => false,
                'message' => 'Esta votación ya está cerrada.',
            ], 403);
        }

        // Creo el voto vinculado a la Votación (NO al game directamente)
        // Solo paso los datos que pertenecen a la tabla 'votes'
        $vote = Vote::create([
            'votation_id' => $votation->id,
            'voter_id' => $validated['voter_id'],
            'target_id' => $validated['target_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Voto registrado correctamente',
            'data' => [
                'vote' => $vote,
            ],
        ], 201);
    }

    /**
     * Obtiene los votos filtrados por partida, fase y ciclo.
     */
    public function getVotes(Request $request, $gameId)
    {
        $request->validate([
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer',
        ]);

        // Uso la auxiliar que devuelve el objeto Votation
        $votation = $this->queryVotation(
            (int) $gameId,
            $request->boolean('is_day'),
            (int) $request->input('day_number')
        );

        // $votes = Vote::where('game_id', $gameId)
        //     ->where('is_day', $request->boolean('is_day'))
        //     ->where('day_number', $request->input('day_number'))
        //     ->get();

        // Si no existe la votación, devuelvo el array vacío para no romper el front pero si quereis se puede cambiar por return success false
        $votes = $votation ? $votation->votes : [];

        return response()->json([
            'success' => true,
            'message' => 'Votos recuperados con éxito',
            'data' => ['votes' => $votes],
        ], 200);
    }

    // Los parametros de entreda se pueden cambiar por Request $request, pero por el momento lo manejo asi

    public function resolveVoting(int $gameId, string $phase, int $cycle)
    {
        // ------------------------------------------------------------ este apartado se cambía si se le proporciona el Request

        // convierto el phase a booleano
        $isDay = ($phase === 'day');
        $dayNumber = $cycle;

        // obtengo la votacion con los votos y los datos del votante (para ver si es alcalde)
        $votation = Votation::where('game_id', $gameId)
            ->where('is_day', $isDay)
            ->where('day_number', $dayNumber)
            ->with(['votes.voter.states']) // Eager loading: traemos el voto y al votante y los estados
            ->first();

        if (! $votation || $votation->votes->isEmpty() || $votation->is_closed) {
            return response()->json([
                'success' => false,
                'message' => 'No hay votos para resolver',
                'data' => null,
            ], 404);
        }// si devuelve esto significa que algo salió mal o que no recibió votos, por lo que se puede tratar para casos que no haya votos

        // logica del conteo
        // Recuento con ponderación
        $tally = []; // Array para contar: [id_candidato => total_puntos]

        $MAYOR_STATE_NAME = 'alcalde'; // sacarlo al env

        foreach ($votation->votes as $vote) {
            $points = 1;

            // Doble voto del alcalde
            if ($isDay) {
                // Verifico si la colección de estados del votante contiene el estado 'alcalde'
                // contains('columna', 'valor') busca en la colección en memoria
                $isMayor = $vote->voter->states->contains('name', $MAYOR_STATE_NAME);

                if ($isMayor) {
                    $points = 2;
                }
            }

            // Sumar votos (acumulamos puntos)
            if (! isset($tally[$vote->target_id])) {
                $tally[$vote->target_id] = 0;
            }
            $tally[$vote->target_id] += $points;
        }

        // ordeno para tener los maximos
        arsort($tally);
        $maxVotes = reset($tally); // obtengo el valor maximo

        // obtengo todos los candidatos con esa cantidad de votos
        $candidates = array_keys($tally, $maxVotes);

        // compruebo los empates
        $isTie = count($candidates) > 1;
        $tieMethod = null;
        $victimId = null;

        // selecciono uno por "coinflip"
        if ($isTie) {
            $randomKey = array_rand($candidates);
            $victimId = $candidates[$randomKey];

            $tieMethod = 'coinflip';
        } else {
            // Ganador único
            $victimId = $candidates[0];
            $tieMethod = 'none';
        }

        /*
            Esto es lo que tendría que hacer desde el padre que llama a esta funcion
            Ya que el resto de eventos se se tienen que ejecutar desde arriba en funcion del resultado y no desde aqui
        $victim = \App\Models\Participant::find($victimId);
        $votation->update(['is_closed' => true]);

        if ($victim) {
            $victim->status = 'dead';
            $victim->save();
            if ($isDay) {
                // Evento Linchamiento
                // event(new GameEvent($gameId, 'lynched', $victim));
            } else {
                // Evento Lobos
                // event(new WolvesEvent($gameId, 'killed', $victim));
            }
        }
         */

        return response()->json([
            'success' => true,
            'message' => 'Votación resuelta',
            'data' => [
                'is_day' => $isDay, // lo paso para saber si ha sido votacion de lobos o de linchamiento
                'resolved_candidate_id' => $victimId,
                'tie_method' => $tieMethod,
                'votes_count' => $maxVotes,
            ],
        ]);

    }

    /**
     * Helper: Busca una Votation y carga sus votos (Eager Loading)
     * Devuelve null si no existe.
     */
    private function queryVotation(int $gameId, bool $isDay, int $dayNumber): ?Votation
    {
        return Votation::where('game_id', $gameId)
            ->where('is_day', $isDay)
            ->where('day_number', $dayNumber)
            ->with('votes') // <----------- Trae los votos en la misma consulta
            ->first();
    }
}
