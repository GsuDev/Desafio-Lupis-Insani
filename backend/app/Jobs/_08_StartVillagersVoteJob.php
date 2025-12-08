<?php

namespace App\Jobs;

use App\Http\Controllers\EventController;
use App\Http\Controllers\GameChannelController;
use App\Http\Controllers\VoteController;
use App\Models\Game;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _08_StartVillagersVoteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $gameId;

    public function __construct(int $gameId)
    {
        $this->gameId = $gameId;
    }

    public function handle(): void
    {
        try {
            $game = Game::find($this->gameId);

            if (! $game) {
                // TODO
                return;
            }

            $duration = (int) env('_08_GAME_VILLAGER_VOTE_DURATION', 30);

            $message = 'La votación de los aldeanos ha comenzado.';
            EventController::systemMessage($message, 'game', $this->gameId);

            // Abre una nueva votación
            $lastDay = VoteController::getLatestVotation($game)->day_number ?? 0;
            $nextDay = $lastDay + 1;
            VoteController::startVotation($this->gameId, 'day', $nextDay);

            GameChannelController::systemSend('game.narrator', ['message' => '¡SILENCIO! A VOTAR'], $this->gameId);

            GameChannelController::systemSend('vote.start', null, $this->gameId);

            // 4. Encadenar siguiente Job (Resolución)
            // Llamamos al Placeholder que creamos antes.
            _02_AnnounceVillagerVotingResultJob::dispatch($this->gameId, false)
                ->delay(now()->addSeconds($duration));
        } catch (Exception $e) {

            EventController::systemMessage(
                'Error al empezar votación'.json_encode($e->getMessage()),
                'game',
                $this->gameId
            );
        }
    }
}
