<?php

namespace App\Http\Controllers;

use App\Events\WolvesEvent;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WolvesChannelController extends Controller
{
    public function send(Request $request, int $gameId)
    {
        $validator = Validator::make($request->all(), [
            'event' => 'required|string',
            'data' => 'required|nullable|array', // se permite null o array
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user = $request->user();

        // se verifica que quien envía el post es realmente un lobo en esta partida

        $participant = Participant::where('user_id', $user->id)
            ->where('game_id', $gameId)
            ->first();

        // si no es participante o no es lobo (ID 2), bloqueamos el envío.
        // cuando se implante la niña esto sepodrá cambiar si fuese necesario
        if (! $participant || $participant->character_id !== 2) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para hablar en este canal.',
            ], 403);
        }

        // GESTIÓN DE LAS ACCIONES DEL EVENTO
        $data = EventController::eventCategoryFilter($validator->validated()['event'], $validator->validated()['data'], $gameId, $user);
        if (isset($data) && $data === ['dontEmit']) {
            return response()->json([
                'success' => true,
                'message' => 'No se debia emitir evento y no se emitió',
                'data' => null,
            ], 200);
        }
        // se emite el evento al canal privado
        // usamos toOthers() para que no se le reenvie el mensaje al que lo escribó
        broadcast(new WolvesEvent(
            $validator->validated()['event'],
            $data ?? [], // si es null se envia array vacio
            $gameId
        ))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Evento enviado a los lobos correctamente.',
            'data' => null,
        ]);

    }

    public static function systemSend($event, $data, $gameId)
    {
        $user = User::where('email', 'system@system.com')->first();

        // GESTIÓN DE LAS ACCIONES DEL EVENTO
        $data = EventController::eventCategoryFilter($event, $data, $gameId, $user);
        try {
            broadcast(new WolvesEvent(
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
