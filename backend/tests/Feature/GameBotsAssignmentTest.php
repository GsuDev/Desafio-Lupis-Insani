<?php

namespace Tests\Feature;

use App\Models\Game;
use App\Models\participant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameBotsAssignmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test 1: Partida vacia (0 humanos).
     * Resultado Esperado: 15 bots (para llegar al minimo)
     */
    public function test_assigns_bots_to_empty_game_until_minimum_reached()
    {
        // preparacion (Arrange)
        $game = Game::factory()->create(); // Crea una partida vacia
        // Actuación
        // LLamamos al endpoint temporal que creamos
        $response = $this->postJson("/api/games/{$game->id}/bots");

        $response->assertStatus(200);

        // Verificamos que la respuesta dice que añadió 15
        $response->assertJson([
            'success' => true,
            'data' => [
                'added' => 15,
                'total_participants' => 15,
            ],
        ]);

        // Verificamos que en la base de datos están realmente
        $this->assertDatabaseCount('participants', 15);
        $this->assertDatabaseHas('participants', [
            'game_id' => $game->id,
            'is_bot' => true,
            'user_id' => null,
        ]);
    }

    /**
     * Escenario 2: Partida con 14 humanos
     * Faltaria 1 para 15 pero la regla de mínimo 2 bots manda
     * debería de dar 16 participantes en total
     */
    public function test_ensures_mandatory_two_bots_even_if_close_to_minimum()
    {
        $game = Game::factory()->create();

        // Se crean 14 usuarios humanos
        $users = User::factory()->count(14)->create();
        foreach ($users as $user) {
            participant::create([
                'game_id' => $game->id,
                'user_id' => $user->id,
                'is_bot' => false,
                'bot_name' => null,
            ]);
        }

        $response = $this->postJson("/api/games/{$game->id}/bots");
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'added' => 2,
                'total_participants' => 16,
            ],
        ]);
    }

    /**
     * Escenario 3: Limite (28 humanos)
     * Debe añadir exactamente los 2 bots obligatorios para llegar a 30
     */
    public function test_fills_bots_correctly_at_max_capacity()
    {
        $game = Game::factory()->create();

        // 28 humanos
        $users = User::factory()->count(28)->create();
        foreach ($users as $user) {
            participant::create([
                'game_id' => $game->id,
                'user_id' => $user->id,
                'is_bot' => false,
            ]);
        }

        $response = $this->postJson("/api/games/{$game->id}/bots");

        $response->assertStatus(200);

        $response->assertJson([
            'success' => true,
            'data' => [
                'added' => 2,
                'total_participants' => 30,
            ],
        ]);
    }

    /**
     * Escenario 4: Violación de integridad (29 humanos)
     * No caben los 2 bots obligatorios. Debe fallar.
     */
    public function test_fails_gracefully_if_not_enough_space_for_mandatory_bots()
    {
        $game = Game::factory()->create();

        // Se crean 29 humanos (no puede ser por lógica)
        $users = User::factory()->count(29)->create();
        foreach ($users as $user) {
            participant::create([
                'game_id' => $game->id,
                'user_id' => $user->id,
                'is_bot' => false,
            ]);
        }

        $response = $this->postJson("/api/games/{$game->id}/bots");

        $response->assertStatus(500);

        $response->assertJson([
            'success' => false,
        ]);
    }
}
