<?php

namespace App\Http\Controllers;

use App\Events\GameEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WolvesChannelController extends Controller
{
    public function send(Request $request, int $gameId)
    {
        $validator = Validator::make($request->all(), [
            'event' => 'required|string',   // ej: "game.start", "player.dead"
            'data' => 'required|nullable|array',    // payload libre
        ]);

        // Emitimos el evento al PresenceChannel game.{id}
        broadcast(new GameEvent(
            event: $validator->validated()['event'],
            data: $validator->validated()['data'] ?? [],
            gameId: $gameId
        ))->toOthers();

        return [
            'success' => true,
            'message' => 'Evento emitido correctamente',
            'data' => null,
        ];
    }
}
