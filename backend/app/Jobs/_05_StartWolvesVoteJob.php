<?php

namespace App\Jobs;

use App\Events\GameEvent;
use App\Events\WolvesEvent;
use App\Models\Game;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _05_StartWolvesVoteJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $gameId;
    /**
     * Create a new job instance.
     */
    public function __construct(int $gameId)
    {
        $this->gameId = $gameId;

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $game = Game::find($this->gameId);
        if (! $game) {
            return;
        }

        //Se tendría que controlar que el juego esté en la noche  ?

        $duration = env('GAME_WOLVES_VOTE_DURATION', 10);

        $text = "Lobos, es hora de acechar. Tenéis {$duration} segundos.";
        $message = $game->addMessage('system', null, $text);

        //envio al chat de los lobos que el evento a comenzado
        broadcast(new WolvesEvent(
            'chat.message',
            ['message' => $message->toStructured()],
            $this->gameId
        ));

        //emito el evento de cambio de fase
        broadcast(new WolvesEvent(
            'wolves.vote.start',
            [
                'phase' => 'night',
                'gameId' => $this->gameId,
            ],
            $this->gameId
        ));


        //Ejemplo:
        _06_TransitionToDayJob::dispatch($this->gameId)
             ->delay(now()->addSeconds($duration)); // Aqui va el job que cambia de noche a día (game.day) y resuelve la votación (según tengo entendido).
    }
}
