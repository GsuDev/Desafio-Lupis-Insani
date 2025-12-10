<?php

namespace App\Http\Controllers;

use App\Events\GameEvent;
use App\Models\participant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GameChannelController extends Controller
{
    public function send(Request $request, int $gameId)
    {
        $validator = Validator::make($request->all(), [
            'event' => 'required|string',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
                'data' => null,
            ], 422);
        }

        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado.',
                'data' => null,
            ], 401);
        }

        $participant = participant::where('user_id', $user->id)
            ->where('game_id', $gameId)
            ->first();

        if (! $participant) {
            return response()->json([
                'success' => false,
                'message' => 'No perteneces a esta partida.',
                'data' => null,
            ], 403);
        }
        // GESTIÓN DE LAS ACCIONES DEL EVENTO
        $data = EventController::eventCategoryFilter($validator->validated()['event'], $validator->validated()['data'], $gameId, $user);

        try {
            if (isset($data) && $data === ['dontEmit']) {
                return response()->json([
                    'success' => true,
                    'message' => 'No se debia emitir evento y no se emitió',
                    'data' => null,
                ], 200);
            }
            broadcast(new GameEvent(
                $validator->validated()['event'],
                $data ?? [],
                $gameId
            ));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al emitir el evento.'.$e,
                'data' => null,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Evento enviado correctamente.',
            'data' => null,
        ]);
    }

    public static function systemSend($event, $data, $gameId)
    {
        $user = User::where('email', 'system@system.com')->first();

        // GESTIÓN DE LAS ACCIONES DEL EVENTO
        $data = EventController::eventCategoryFilter($event, $data, $gameId, $user);
        try {
            broadcast(new GameEvent(
                $event,
                $data ?? [],
                $gameId
            ));

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }
}
