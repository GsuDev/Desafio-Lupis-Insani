<?php

namespace App\Jobs;

use App\Http\Controllers\EventController;
use App\Http\Controllers\GameChannelController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\VoteController;
use App\Models\Game;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _02_AnnounceVillagerVotingResultJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $gameId;

    public bool $isFirstDay;

    /**
     * Create a new job instance.
     */
    public function __construct(int $gameId, bool $isFirstDay)
    {
        $this->gameId = $gameId;
        $this->isFirstDay = $isFirstDay;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try { // 1. Cargar la partida
            $game = Game::find($this->gameId);

            if (! $game) {
                // TODO: Lanzar error (usar logger)
                return;
            }
            $duration = (int) env('_02_GAME_VILLAGER_VOTATION_RESULT_DURATION', 30);
            // 2. Cerrar y resolver votación
            $latestVotation = VoteController::getLatestVotation($game);
            $response = VoteController::resolveVoting($this->gameId, 'day', $latestVotation->day_number);
            $latestVotation = VoteController::closeLatestVotation($latestVotation);

            if (! isset($response['success']) || ! $response['success']) {
                $this->handleVotingError($game, $response);

                return;
            }

            // 3. Procesar resultado de la votación
            $result = $response['data'];
            $victimId = $result['resolved_candidate_id'];

            $votingResult = VoteController::processVillagerVotingResult(
                $game,
                $victimId,
                $this->isFirstDay
            );

            // 5. Emitir evento chat.message
            EventController::systemMessage($votingResult['message'], 'game', $this->gameId);
            // 6. Comprobar condiciones de victoria
            $winStatus = GameController::checkGameStatus($this->gameId);

            // 7. Emitir evento vote.result
            GameChannelController::systemSend(
                'vote.result',
                [
                    'dead_participant' => $votingResult['victim'],
                ],
                $this->gameId
            );

            // 8. Continuar el ciclo o finalizar juego
            if (! $winStatus['data']['winner']) {
                _03_TransitionToNightJob::dispatch($this->gameId)->delay(now()->addSeconds($duration));
            } else {
                GameChannelController::systemSend(
                    'game.conditions',
                    $winStatus,
                    $this->gameId
                );
            }
        } catch (Exception $e) {
            EventController::systemMessage('ERROR'.json_encode($e->getFile()).'LINEA:  '.json_encode($e->getLine()), 'game', $this->gameId);
        }
    }

    /**
     * Maneja errores en la votación
     */
    private function handleVotingError($game, $response): void
    {
        $messageText = 'Hubo un error al intentar resolver la votación :c'.json_encode($response);

        EventController::systemMessage($messageText, 'game', $this->gameId);
    }
}
