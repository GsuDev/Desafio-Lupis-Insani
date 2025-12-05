<?php

namespace Tests\Feature;

use App\Events\GameEvent;
use App\Jobs\NightWolvesTalkJob;
use App\Jobs\TransitionToNightJob;
use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue; // El Placeholder
use Tests\TestCase;

class TransitionToNightJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_transitions_to_night_successfully()
    {
        Event::fake();
        Queue::fake();

        $game = Game::factory()->create([
            'state' => 'on_course',
        ]);

        $job = new TransitionToNightJob($game->id);
        $job->handle();

        $this->assertDatabaseHas('messages', [
            'game_id' => $game->id,
            'type' => 'system',
            'message' => 'La aldea se sumerge en la oscuridad. Todos duermen... excepto los lobos.',
        ]);

        Event::assertDispatched(GameEvent::class, function ($event) use ($game) {
            return $event->event === 'chat.message'
                && $event->gameId === $game->id;
        });

        Event::assertDispatched(GameEvent::class, function ($event) use ($game) {
            return $event->event === 'game.night'
                && $event->gameId === $game->id
                && $event->data['phase'] === 'night';
        });

        // D) Siguiente Job (Lobos)
        // Queue::assertPushed(NightWolvesTalkJob::class, function ($job) use ($game) {
        // return true;
        // });
    }
}
