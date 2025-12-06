<?php

namespace App\Jobs;

use App\Events\GameEvent;
use App\Models\Game;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _03_TransitionToNightJob implements ShouldQueue
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

        $text = 'La aldea se sumerge en la oscuridad. Todos duermen... excepto los lobos.';

        $message = $game->addMessage('system', null, $text);

        broadcast(new GameEvent(
            'chat.message',
            ['message' => $message->toStructured()],
            $this->gameId
        ));

        broadcast(new GameEvent(
            'game.night',
            [
                'phase' => 'night',
            ],
            $this->gameId
        ));

        $delay = 5;

        _04_WolvesDiscussionJob::dispatch($this->gameId)
            ->delay(now()->addSeconds($delay));

    }
}
