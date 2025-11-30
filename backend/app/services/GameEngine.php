<?php

namespace App\Services;

use App\Events\GameEvent;
use App\Jobs\FirstPartJob;

class GameEngine
{
    public static function startDay(int $gameId)
    {

        // game.day.start
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'Se hace de dia',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            $gameId
        ));

        // vote.start
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'Empieza la votación',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            $gameId
        ));

        // Programar primera parte para k empiece dentro de 5 segundos
        FirstPartJob::dispatch($gameId)->delay(5);
    }
}
