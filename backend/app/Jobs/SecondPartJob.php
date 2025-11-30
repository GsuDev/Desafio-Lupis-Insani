<?php

namespace App\Jobs;

use App\Events\GameEvent;
use App\Services\GameEngine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SecondPartJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $gameId;

    /**
     * Create a new job instance.
     */
    public function __construct(int $gameId)
    {
        $this->gameId = $gameId;
    }

    /**
     * Execute the job.
     *
     * Aquí emitimos el evento de inicio de votación
     */
    public function handle()
    {
        // $result = voteResult()

        // Emitimos el evento "vote.result" al juego
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'RESULTADO: Los lobos matan a victor',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            1
        ));
        // GameEngine::startDay(1);

    }
}
