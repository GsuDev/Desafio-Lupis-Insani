<?php

namespace Tests\Feature;

use App\Events\GameEvent;
use App\Jobs\FirstDayStartMayorVoteJob;
use App\Models\Game;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class FirstDayStartMayorVoteJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_starts_mayor_vote_successfully()
    {
        // el arrange
        Event::fake();
        Queue::fake();

        $game = Game::factory()->create([
            'state' => 'on_course',
        ]);

        // act
        $job = new FirstDayStartMayorVoteJob($game->id);
        $job->handle();

        // verificar

        // Verificamos mensaje en BD
        $this->assertDatabaseHas('messages', [
            'game_id' => $game->id,
            'type' => 'system',
            'message' => '¡Silencio! Comienza la votación para elegir al alcalde. Tenéis 30 segundos.',
        ]);

        // Verificamos Evento Chat
        Event::assertDispatched(GameEvent::class, function ($event) use ($game) {

            return $event->event === 'chat.message'
                && $event->gameId === $game->id;
        });

        // Verificamos Evento Cambio de Fase
        Event::assertDispatched(GameEvent::class, function ($event) use ($game) {
            // CORREGIDO: Usamos $event->event en lugar de $event->type
            return $event->event === 'vote.start'
                && $event->gameId === $game->id
                && $event->data['phase'] === 'primer_dia'
                && $event->data['type'] === 'eleccion_alcalde';
        });

    }
}
