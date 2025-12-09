<?php

namespace App\Jobs;

use App\Events\GameEvent;
use App\Http\Controllers\GameChannelController;
use App\Http\Controllers\GameController;
use App\Models\Game;
use App\Models\Votation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _01_FirstDayStartMayorVoteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $gameId;

    public function __construct(int $gameId)
    {
        $this->gameId = $gameId;
    }

    public function handle(): void
    {

        $game = Game::find($this->gameId);

        if (! $game) {
            // TODO
            return;
        }

        // obtenemos la duracion desde la config que creamos
        // $duration = config('game.timers.mayor_vote_duration', 30);
        $duration = (int) env('_01_GAME_MAYOR_VOTATION_DURATION', 30);
        $text = "¡Silencio! Comienza la votación para elegir al alcalde. Tenéis {$duration} segundos.";

        // con el controller seria asi
        // $controller = new GameController();
        // $controller->addMessageByGame(['message' => 'texto'], 'system', $gameId,null);

        // lo hago utilizando el modelo directamente, si no gusta puede poner como el controller arriba
        $message = $game->addMessage('system', null, $text);

        broadcast(new GameEvent(
            'chat.message',
            ['message' => $message->toStructured()], // aplica patron dto para envio de datos al frontend, devuelve array
            $this->gameId
        ));
        GameChannelController::systemSend('game.narrator', ['message' => 'Comienza la votación para elegir al alcalde', 'phase'=>'DAY_VOTING'], $this->gameId);
        $votation = new Votation(['game_id' => $this->gameId, 'is_day' => true, 'day_number' => 1, 'is_closed' => false]);
        $votation->save();

        // se emite el evente de cambio de fase vote.start
        broadcast(new GameEvent(
            'vote.start',
            [
                'phase' => 'primer_dia',
                'type' => 'eleccion_alcalde',
                'gameId' => $this->gameId,
                'day_number' => 1,
            ],
            $this->gameId
        ));

        _02_AnnounceVillagerVotingResultJob::dispatch($this->gameId, true)
            ->delay(now()->addSeconds($duration));
    }
}
