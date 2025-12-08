<?php

namespace App\Jobs;

use App\Events\WolvesEvent;
use App\Http\Controllers\GameChannelController;
use App\Http\Controllers\VoteController;
use App\Models\Game;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _05_StartWolvesVoteJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, Queueable, SerializesModels;

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

        // Se tendría que controlar que el juego esté en la noche  ?

        $duration = (int) env('_05_GAME_WOLVES_VOTATION_DURATION', 10);

        $text = "Lobos, es hora de acechar. Tenéis {$duration} segundos.";
        $message = $game->addMessage('system', null, $text);

        GameChannelController::systemSend('game.narrator', ['message' => 'Senteis la presencia del terror'], $this->gameId);

        // envio al chat de los lobos que el evento a comenzado
        broadcast(new WolvesEvent(
            'chat.message',
            ['message' => $message->toStructured()],
            $this->gameId
        ));

        // Abre una nueva votación
        $lastDay = VoteController::getLatestVotation($game)->day_number ?? 0;
        VoteController::startVotation($this->gameId, 'night', $lastDay);
        // emito el evento de cambio de fase
        broadcast(new WolvesEvent(
            'vote.start',
            [
                'phase' => 'night',
                'gameId' => $this->gameId,
            ],
            $this->gameId
        ));

        // Ejemplo:
        _06_TransitionToDayJob::dispatch($this->gameId)
            ->delay(now()->addSeconds($duration)); // Aqui va el job que cambia de noche a día (game.day) y resuelve la votación (según tengo entendido).
    }
}
