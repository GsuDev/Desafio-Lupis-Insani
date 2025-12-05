<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Game;
use App\Events\GameEvent;
use App\Events\WolvesEvent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use App\Jobs\WolvesDiscussionJob;
use App\Jobs\StartWolvesVotingJob;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WolvesDiscussionJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_starts_wolves_discussion_successfully()
    {
       
        Event::fake();
        Queue::fake();

        $game = Game::factory()->create([
            'state' => 'on_course'
        ]);

 
        $job = new WolvesDiscussionJob($game->id);
        $job->handle();

      
        
       
        $this->assertDatabaseHas('messages', [
            'game_id' => $game->id,
            'type' => 'system',
            'message' => 'Unos aullidos rompen el silencio. Los lobos se comunican...',
        ]);

        
        Event::assertDispatched(GameEvent::class, function ($event) use ($game) {
            return $event->event === 'chat.message' 
                && $event->gameId === $game->id;
        });

        
        Event::assertDispatched(WolvesEvent::class, function ($event) use ($game) {
            return $event->event === 'wolves.discussion'
                && $event->gameId === $game->id
                && isset($event->data['duration'])
                && $event->data['game.conditions']['finished'] === false;
        });

        // D) Siguiente Job
        //Queue::assertPushed(StartWolvesVotingJob::class, function ($job) use ($game) {
          //  return true;
        //});
    }
}