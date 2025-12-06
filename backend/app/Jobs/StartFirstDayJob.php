<?php

namespace App\Jobs;

use App\Http\Controllers\EventController;
use App\Http\Controllers\GameChannelController;
use App\Models\Game;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class StartFirstDayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $gameId;

    public function __construct(int $gameId)
    {
        $this->gameId = $gameId;
    }

    public function handle(): void
    {

        // 1. Cargar la partida
        $game = Game::find($this->gameId);

        if (! $game) {
            // TODO
            return;
        }

        // 2. Verificar que estamos en la fase correcta
        // TODO

        $message = 'Comienza la elección del alcalde. Los jugadores pueden discutir durante este periodo antes de votar.';

        // 4. Emitir evento chat.message
        EventController::systemMessage($message, 'game', $this->gameId);

        // 5. Emitir evento game.discussion
        GameChannelController::systemSend('game.discussion', null, $this->gameId);
        // 6. Encadenar el siguiente job (HU-02) con delay configurable
        // $delaySeconds = 30;
        // FirstDayStartMayorVotingJob::dispatch($this->gameId)
        //     ->delay($delaySeconds);

    }
}
