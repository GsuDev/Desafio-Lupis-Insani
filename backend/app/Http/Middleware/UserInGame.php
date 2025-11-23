<?php

namespace App\Http\Middleware;

use App\Http\Controllers\GameChannelController;
use App\Models\Game;
use Closure;
use Illuminate\Http\Request;

class UserInGame
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $gameId = (int) $request->route('gameId');

        // 1. Validar que la partida existe opcionalmente
        if (! Game::where('id', $gameId)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Partida no encontrada',
                'data' => null,
            ], 404);
        }

        // 2. Validar que el user esté en el canal como humano (no bot)
        $isParticipant = GameChannelController::userInGameChannel($user, $gameId);

        if (! $isParticipant) {
            return response()->json([
                'success' => false,
                'message' => 'No eres participante de esta partida',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
