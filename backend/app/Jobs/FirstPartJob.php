<?php

namespace App\Jobs;

use App\Events\GameEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FirstPartJob implements ShouldQueue
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

        // Emitimos el evento "vote.finish" al juego
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'RESULTADO: Echamos a Sergio -> Era un lobo 🐺',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            1
        ));

        // {Comprobar condiciones victoria derrota}

        // game.conditions
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'El juego sigue',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            1
        ));

        // game.conditions
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'LLega la noche: El pueblo duerme',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            1
        ));

        // game.conditions
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'LLega la noche: El pueblo duerme -> Se despiertan los lobos',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            1
        ));

        // vote.start
        broadcast(new GameEvent(
            'chat.message',

            [
                'message' => [
                    'gameId' => 1,
                    'id' => 106,
                    'message' => 'Empieza la votacion de los lobos',
                    'nickname' => 'NARRADOR',
                    'profileUrl' => null,
                    'time' => '2025-11-30T13:21:48.000000Z',
                    'type' => 'user',
                    'userId' => 1,
                ],
            ],
            1
        ));

        // Programar primera parte para k empiece dentro de 5 segundos
        SecondPartJob::dispatch(1)->delay(5);
    }
}
