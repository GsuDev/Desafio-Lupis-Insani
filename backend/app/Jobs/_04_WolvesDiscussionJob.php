<?php

namespace App\Jobs;

use App\Events\GameEvent;
use App\Events\WolvesEvent;
use App\Models\Game;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _04_WolvesDiscussionJob implements ShouldQueue
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

        $duration = (int) env('_04_GAME_WOLVES_DISCUSSION_DURATION', 30);

        $text = 'Unos aullidos rompen el silencio. Los lobos se comunican...';
        $message = $game->addMessage('system', null, $text);

        broadcast(new GameEvent(
            'chat.message',
            ['message' => $message->toStructured()],
            $this->gameId
        ));

        broadcast(new WolvesEvent(
            'wolves.discussion',
            [
                'duration' => $duration,
                'game.conditions' => [
                    'finished' => false,
                    'winners' => null,
                ],
            ],
            $this->gameId
        ));

        // Encadenar siguiente Job (Votación de Lobos)
        _05_StartWolvesVoteJob::dispatch($this->gameId)
            ->delay(now()->addSeconds($duration));

    }
}
