<?php

use App\Http\Controllers\GameChannelController;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    // return GameChannelController::userInGameChannel($user, $gameId);
    return [
        'message' => 'buenos dias',
    ];
});
