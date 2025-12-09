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

class _06_TransitionToDayJob implements ShouldQueue
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

            $duration = (int) env('_06_GAME_TRANSITION_TO_DAY_DURATION', 10);
            // esto para calcular el dia y poder sumarle uno
            $lastDay = VoteController::getLatestVotation($game)->day_number ?? 0;

            $currentDay = $lastDay + 1;

            $message = "Amanece en el pueblo... Un nuevo día comienza (Día {$currentDay})";

            GameChannelController::systemSend('game.narrator', ['message' => $message, 'phase'=>'DAY_START'], $this->gameId);

            EventController::systemMessage($message, 'system', $this->gameId);

            GameChannelController::systemSend(
                'game.day',
                [
                    'phase' => 'day',
                    'day_number' => $currentDay,
                ],
                $this->gameId
            );

            // 4. ENCADENAR SIGUIENTE JOB
            // Pasamos el testigo para resolver qué pasó por la noche (muertes, etc.)
            _07_AnnounceWolvesVotingResultJob::dispatch($this->gameId)
                ->delay(now()->addSeconds($duration)); // Pequeña pausa dramática

        } catch (Exception $e) {

            EventController::systemMessage(
                'Error al cambiar a dia'.json_encode($e->getMessage()),
                'game',
                $this->gameId
            );
        }
    }
}
