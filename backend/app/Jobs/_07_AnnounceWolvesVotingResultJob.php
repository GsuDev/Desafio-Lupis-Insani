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

class _07_AnnounceWolvesVotingResultJob implements ShouldQueue
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
     */
    public function handle(): void
    {
        try {
            // 1. Cargar la partida
            $game = Game::find($this->gameId);

            if (!$game) {
                // TODO:
                return;
            }

            // 2. Obtener última votación
            $latestVotation = VoteController::getLatestVotation($game);

            if (!$latestVotation) {
                EventController::systemMessage('No se encontró votación activa de lobos', 'game', $this->gameId);

                return;
            }

            // 3. Resolver votación de NOCHE (lobos)
            $response = VoteController::resolveVoting($this->gameId, 'night', $latestVotation->day_number);

            // 4. Cerrar votación
            $latestVotation = VoteController::closeLatestVotation($latestVotation);

            if (!isset($response['success']) || !$response['success']) {
                $this->handleVotingError($game, $response);

                return;
            }

            // 5. Procesar resultado de la votación de lobos
            $result = $response['data'];
            $victimId = $result['resolved_candidate_id'];

            $votingResult = VoteController::processWolvesVotingResult($game, $victimId);

            // 6. Emitir evento chat.message al canal de lobos
            GameChannelController::systemSend('game.narrator', ['message' => $votingResult['message']], $this->gameId);

            EventController::systemMessage($votingResult['message'], 'game', $this->gameId);

            // 7. Emitir evento vote.result al canal de lobos
            GameChannelController::systemSend(
                'vote.result',
                [
                    'participant_id' => $votingResult['victim'],
                    'dead' => true,
                ],
                $this->gameId
            );

            // 8. Anunciar inicio de discusión de aldeanos (amanecer)
            $duration = (int) env('_07_GAME_VILLAGER_DISCUSSION_DURATION', 30);
            $dawnMessage = $this->generateDawnMessage($votingResult['victim']);

            // 9. Emitir mensaje de amanecer al canal general
            EventController::systemMessage($dawnMessage, 'game', $this->gameId);

            // 10. Emitir evento game.discussion para indicar fase de discusión
            GameChannelController::systemSend('game.discussion', null, $this->gameId);

            // 11. Encadenar siguiente job (inicio de votación de aldeanos)

            // 6. Comprobar condiciones de victoria
            $winStatus = GameController::checkGameStatus($this->gameId);

            // 8. Continuar el ciclo o finalizar juego
            if (!$winStatus['data']['winner']) {
                _08_StartVillagersVoteJob::dispatch($this->gameId)
                    ->delay(now()->addSeconds($duration));
            } else {
                GameChannelController::systemSend(
                    'game.conditions',
                    $winStatus,
                    $this->gameId
                );
            }

        } catch (Exception $e) {

            EventController::systemMessage(
                'Error al procesar resultado de votación de lobos: ',
                'game',
                $this->gameId
            );
        }
    }

    /**
     * Maneja errores en la votación
     */
    private function handleVotingError(Game $game, array $response): void
    {
        $messageText = 'Hubo un error al intentar resolver la votación de los lobos: ' . json_encode($response);
        EventController::systemMessage($messageText, 'game', $this->gameId);
    }

    /**
     * Genera mensaje de amanecer según si hubo víctima o no
     */
    private function generateDawnMessage($victim): string
    {
        if ($victim) {
            $messages = [
                "Amanece en el pueblo. Los aldeanos descubren con horror que {$victim->nickname} no sobrevivió la noche. Ahora deben decidir a quién linchar.",
                "El sol sale sobre el pueblo, revelando una tragedia: {$victim->nickname} ha sido asesinado. Es hora de deliberar y votar.",
                "La luz del alba trae malas noticias. {$victim->nickname} fue víctima de la noche. Los aldeanos deben actuar.",
                "El pueblo despierta y encuentra a {$victim->nickname} sin vida. La discusión para decidir el linchamiento comienza ahora.",
                "Amanecer sombrío: {$victim->nickname} no verá otro día. Los supervivientes deben elegir a quién ejecutar.",
            ];
        } else {
            $messages = [
                'Amanece en el pueblo. Milagrosamente, todos sobrevivieron la noche. Ahora deben decidir a quién linchar.',
                'El sol sale y todos respiran aliviados: no hubo víctimas esta noche. Pero la votación debe continuar.',
                'La luz del alba revela que nadie murió durante la noche. Es momento de deliberar sobre el linchamiento.',
                'Por fortuna, todos amanecieron con vida. Ahora los aldeanos deben votar por quién ejecutar.',
                'El pueblo despierta intacto. Sin víctimas nocturnas, deben concentrarse en encontrar a los lobos.',
            ];
        }

        return $messages[array_rand($messages)];
    }
}
