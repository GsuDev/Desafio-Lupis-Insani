<?php

namespace App\Jobs;

use App\Models\Game;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GameChannelController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class StartVillagersVoteJob implements ShouldQueue
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

        if (!$game) {
            //TODO
            return;
        }

        
        $duration = env('GAME_VILLAGERS_VOTE_DURATION', 30);

        $message = "La votación de los aldeanos ha comenzado.";
        EventController::systemMessage($message, 'game', $this->gameId);

        GameChannelController::systemSend('vote.start', null, $this->gameId);

        // 4. Encadenar siguiente Job (Resolución)
        // Llamamos al Placeholder que creamos antes.
        //VoteResultVillagersJob::dispatch($this->gameId)
          //  ->delay(now()->addSeconds($duration));

        
    }
}