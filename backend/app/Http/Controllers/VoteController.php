<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\participant;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoteController extends Controller
{
    public static function vote($data, $gameId, $user)
    {

        // 1. Validación básica de inputs
        $validator = Validator::make($data, [
            'targetId' => 'required|integer|exists:participants,id',
            'isDay' => 'required|boolean',
            'dayNumber' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return [
                'success' => false,
                'message' => $validator->errors(),
                'data' => null,
            ];
        }

        $voteData = $validator->validated();

        // 2. Participante votante
        $participant = Participant::where('user_id', $user->id)
            ->where('game_id', $gameId)
            ->with('state')
            ->first();

        $check = self::validateUserInGame($participant);
        if (! $check['success']) {
            return $check;
        }

        // 3. Validar ciclo día/noche según BBDD
        $check = self::validateCycle($gameId, $voteData['dayNumber'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // 4. Validaciones según fase (día o noche)
        $check = self::validatePhaseRestrictions($participant, $voteData['targetId'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // 5. Validar objetivo vivo
        $check = self::validateTargetAlive($voteData['targetId']);
        if (! $check['success']) {
            return $check;
        }

        // 6. Validar que no haya votado ya
        $check = self::validateRepeatedVote($participant->id, $gameId, $voteData['dayNumber'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // Registrar voto
        $structured = [
            'game_id' => $gameId,
            'voter_id' => $participant->id,
            'target_id' => $voteData['targetId'],
            'is_day' => $voteData['isDay'],
            'day_number' => $voteData['dayNumber'],
        ];

        $vote = Vote::create($structured);

        return [
            'success' => true,
            'message' => 'Voto registrado correctamente',
            'data' => ['vote' => $vote], // ajustar segun la capa de emision
        ];
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

        $votes = Vote::where('game_id', $gameId)
            ->where('is_day', $request->boolean('is_day'))
            ->where('day_number', $request->input('day_number'))
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Votos recuperados con exito',
            'data' => [
                'votes' => $votes,
            ],
        ], 200);
    }

    private static function validateUserInGame($participant)
    {
        if (! $participant) {
            return [
                'success' => false,
                'message' => 'No perteneces a esta partida.',
                'status' => 403,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    // TODO VICTOR: CAMBIAR PARA VALIDAR QUE NO VOTE EN UN CICLO (combinacion dayNumber y isDay) que no debe
    private static function validateCycle($gameId, $dayNumber, $isDay)
    {
        $game = Game::find($gameId);

        if (! $game) {
            return [
                'success' => false,
                'message' => 'La partida no existe.',
                'status' => 404,
                'data' => null,
            ];
        }

        if ($game->day_number != $dayNumber || $game->is_day != $isDay) {
            return [
                'success' => false,
                'message' => 'El ciclo enviado no coincide con el actual.',
                'status' => 422,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    // Entiendase phase por day/night
    private static function validatePhaseRestrictions($participant, $targetId, $isDay)
    {
        $role = $participant->character_id;

        $target = Participant::with('state')->find($targetId);
        $targetRole = $target->character_id;

        // === NOCHE ===
        if (! $isDay) {

            // Solo lobos votan de noche
            if ($role !== 2) {
                return [
                    'success' => false,
                    'message' => 'Solo los lobos pueden votar de noche.',
                    'status' => 422,
                    'data' => null,
                ];
            }

            // Lobo no mata a lobo
            if ($targetRole === 2) {
                return [
                    'success' => false,
                    'message' => 'Un lobo no puede votar a otro lobo.',
                    'status' => 422,
                    'data' => null,
                ];
            }
        }

        // DÍA -> todos los vivos pueden votar, no hay restricciones especiales

        return ['success' => true];
    }

    private static function validateTargetAlive($targetId)
    {
        $target = Participant::with('state')->find($targetId);

        if (! $target) {
            return [
                'success' => false,
                'message' => 'El jugador objetivo no existe.',
                'status' => 422,
                'data' => null,
            ];
        }

        // muerto si tiene state y state = 'dead'
        if ($target->state && $target->state->state === 'dead') {
            return [
                'success' => false,
                'message' => 'Ese jugador está muerto.',
                'status' => 422,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    private static function validateRepeatedVote($voterId, $gameId, $dayNumber, $isDay)
    {
        $exists = Vote::where('voter_id', $voterId)
            ->where('game_id', $gameId)
            ->where('day_number', $dayNumber)
            ->where('is_day', $isDay)
            ->exists();

        if ($exists) {
            return [
                'success' => false,
                'message' => 'Ya has votado en esta fase.',
                'status' => 422,
                'data' => null,
            ];
        }

        return ['success' => true];
    }
}
