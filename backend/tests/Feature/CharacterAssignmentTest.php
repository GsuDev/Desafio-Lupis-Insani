<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\Participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CharacterAssignmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Esto es lo que hace migrate:fresh --seed
        $this->artisan('migrate:fresh', ['--seed' => true])->run();

        // Ahora la tabla characters ya tiene todos los personajes
    }

    /** @test */
    public function assigns_characters_successfully()
    {
        $game = Game::factory()->create();

        // Crear participantes humanos usando factory de User
        $users = User::factory(20)->create();

        foreach ($users as $user) {
            Participant::create([
                'game_id' => $game->id,
                'user_id' => $user->id,
                'is_bot' => false,
            ]);
        }

        // Crear bots
        Participant::create(['game_id' => $game->id, 'is_bot' => true]);
        Participant::create(['game_id' => $game->id, 'is_bot' => true]);

        $controller = new \App\Http\Controllers\CharacterController;
        $response = $controller->assignCharacters($game);

        $this->assertTrue($response['success']);
        $this->assertEquals('Personajes asignados correctamente', $response['message']);
        $this->assertNotEmpty($response['data']);

        // Comprobar que todos los participantes tienen character_id
        foreach ($response['data'] as $participant) {
            $this->assertNotNull($participant->character_id);
        }

        // Comprobar que los dos primeros bots tienen character_id 1 y 2
        $bots = $game->participants->where('is_bot', true)->values();
        $this->assertEquals(1, $bots[0]->character_id); // Aldeano
        $this->assertEquals(2, $bots[1]->character_id); // Lobo
    }

    /** @test */
    public function fails_when_less_than_two_bots()
    {
        $game = Game::factory()->create();

        // Solo un bot
        Participant::create(['game_id' => $game->id, 'is_bot' => true]);

        $controller = new \App\Http\Controllers\CharacterController;
        $response = $controller->assignCharacters($game);

        $this->assertFalse($response['success']);
        $this->assertEquals('Error: Se requieren al menos 2 bots para iniciar la partida.', $response['message']);
        $this->assertNull($response['data']);
    }

    /** @test */
    public function fails_when_no_participants()
    {
        $game = Game::factory()->create();

        $controller = new \App\Http\Controllers\CharacterController;
        $response = $controller->assignCharacters($game);

        $this->assertFalse($response['success']);
        $this->assertEquals('Error: No hay participantes en la partida.', $response['message'] ?? '');
        $this->assertNull($response['data']);
    }

    /** @test */
    public function respects_unique_characters_env_flag()
    {
        putenv('USE_UNIQUE_CHARACTERS=false');

        $game = Game::factory()->create();

        // Bots
        Participant::create(['game_id' => $game->id, 'is_bot' => true]);
        Participant::create(['game_id' => $game->id, 'is_bot' => true]);

        // Humanos usando factory de User
        $users = User::factory(20)->create();
        foreach ($users as $user) {
            Participant::create([
                'game_id' => $game->id,
                'user_id' => $user->id,
                'is_bot' => false,
            ]);
        }

        $controller = new \App\Http\Controllers\CharacterController;
        $response = $controller->assignCharacters($game);
        $this->assertTrue($response['success']);

        $participants = $game->participants()->with('character')->get();
        $humans = $participants->where('is_bot', false)->values();

        // Comprobar que ninguno de los humanos tiene character_id de personajes únicos (id > 2)
        foreach ($humans as $human) {

            $this->assertTrue(in_array($human->character_id, [1, 2]));
        }
    }
}
