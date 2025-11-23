<?php

namespace App\Http\Controllers;

use App\Events\GameEvent;
use Illuminate\Http\Request;

class WolvesChannelController extends Controller
{
    public function send(Request $request, int $gameId)
    {
        $validated = $request->validate([
            'event' => 'required|string',   // ej: "game.start", "player.dead"
            'data' => 'nullable|array',    // payload libre
        ]);

        // Emitimos el evento al PresenceChannel game.{id}
        broadcast(new GameEvent(
            event: $validated['event'],
            data: $validated['data'] ?? [],
            gameId: $gameId
        ))->toOthers();

        return response()->json([
            'status' => 'ok',
        ]);
    }
}
