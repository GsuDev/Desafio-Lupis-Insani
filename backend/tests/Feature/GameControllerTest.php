<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Game;
use App\Models\User;
use App\Models\Message;

class GameControllerTest extends TestCase
{
    use RefreshDatabase;
    use WithFaker;

    /**
     * Prueba que podemos crear un nuevo juego.
     * @test
     */
    public function test_can_create_a_game()
    {
        // Act: Llama al endpoint de creación
        $response = $this->postJson('/api/games');

        // Assert: Comprueba la respuesta
        $response->assertStatus(201) // 201 Created
            ->assertJson([
                'ended' => false, // Comprueba el valor por defecto
            ])
            ->assertJsonStructure(['id', 'url', 'ended', 'created_at']); // Comprueba la estructura

        // Assert: Comprueba que el juego existe en la base de datos
        $this->assertDatabaseHas('games', [
            'id' => $response->json('id'),
            'ended' => false,
        ]);
    }

    /**
     * Prueba que podemos obtener un juego existente.
     * @test
     */
    public function test_can_get_a_game()
    {
        // Arrange: Crea un juego en la BBDD
        $game = Game::factory()->create();

        // Act: Llama al endpoint para obtener el juego
        $response = $this->getJson("/api/games/{$game->id}");

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'id' => $game->id,
                'url' => $game->url,
            ]);
    }

    /**
     * Prueba que obtener un juego inexistente devuelve 404.
     * @test
     */
    public function test_get_game_returns_404_for_non_existent_game()
    {
        // Act: Llama al endpoint con un ID que no existe
        $response = $this->getJson('/api/games/999');

        // Assert: Comprueba la respuesta
        $response->assertStatus(404);
    }

    /**
     * Prueba que podemos obtener un juego por su URL.
     * @test
     */
    public function test_can_get_a_game_by_url()
    {
        // Arrange: Crea un juego con una URL específica
        $game = Game::factory()->create([
            'url' => 'test-url-unica-123'
        ]);

        // Act: Llama al endpoint para obtener el juego por URL
        $response = $this->getJson("/api/games/url/{$game->url}");

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'id' => $game->id,
                'url' => 'test-url-unica-123',
            ]);
    }
    /**
     * Prueba que obtener un juego por URL inexistente devuelve 404.
     * @test
     */
    public function test_get_game_by_url_returns_404_for_non_existent_url()
    {
        // Act: Llama al endpoint con una URL que no existe
        $response = $this->getJson('/api/games/url/url-que-no-existe');

        // Assert: Comprueba la respuesta
        $response->assertStatus(404);
    }

    /**
     * Prueba que podemos obtener una lista de todos los juegos.
     * @test
     */
    public function test_can_get_all_games()
    {
        // Arrange: Crea 3 juegos
        Game::factory()->count(3)->create();

        // Act: Llama al endpoint de "index" (obtener todos)
        $response = $this->getJson('/api/games');

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(3); // Comprueba que hay 3 juegos en el array raíz
    }

    /**
     *  Prueba que la lista de juegos está vacía si no hay juegos.
     * @test
     */
    public function test_get_all_games_returns_empty_array_when_no_games()
    {
        // Act: Llama al endpoint de "index" sin juegos en la BBDD
        $response = $this->getJson('/api/games');

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJsonCount(0) // Comprueba que hay 0 juegos
            ->assertJson([]); // Comprueba que la respuesta es un array vacío
    }



    /**
     * Prueba que podemos actualizar un juego (marcarlo como terminado).
     * @test
     */
    public function test_can_update_a_game()
    {
        // Arrange: Crea un juego sin terminar
        $game = Game::factory()->create(['ended' => false]);
        $payload = ['ended' => true];

        // Act: Llama al endpoint de actualización
        $response = $this->putJson("/api/games/{$game->id}", $payload);

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJson([
                'id' => $game->id,
                'ended' => true, // Comprueba que la respuesta JSON está actualizada
            ]);

        // Assert: Comprueba que la base de datos está actualizada
        $this->assertDatabaseHas('games', [
            'id' => $game->id,
            'ended' => true,
        ]);
    }

    /**
     * Prueba que la validación falla si 'ended' no se envía.
     * @test
     */
    public function test_update_game_fails_validation_for_missing_ended()
    {
        // Arrange: Crea un juego
        $game = Game::factory()->create();

        // Act: Llama al endpoint sin payload
        $response = $this->putJson("/api/games/{$game->id}", []);

        // Assert: Comprueba la respuesta de validación
        $response->assertStatus(422) // 422 Unprocessable Entity
            ->assertJsonValidationErrors('ended'); // Comprueba que 'ended' falló la validación
    }

    /**
     * Prueba que podemos hacer un "soft delete" a un juego.
     * @test
     */
    public function test_can_soft_delete_a_game()
    {
        // Arrange: Crea un juego
        $game = Game::factory()->create();

        // Act: Llama al endpoint de borrado
        $response = $this->deleteJson("/api/games/{$game->id}");

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJson(['mensaje' => 'Partida eliminada']);

        // Assert: Comprueba que el juego está "soft deleted"
        $this->assertSoftDeleted('games', [
            'id' => $game->id,
        ]);
    }

    /**
     * Prueba que podemos obtener los mensajes de un juego.
     * @test
     */
    public function test_can_get_messages_by_game()
    {
        // Arrange: Crea un juego y un mensaje asociado
        $user = User::factory()->create();
        $game = Game::factory()->create();
        $message = Message::factory()->create([
            'game_id' => $game->id,
            'user_id' => $user->id,
            'message' => 'Este es un mensaje de prueba',
        ]);

        // Act: Llama al endpoint
        $response = $this->getJson("/api/games/{$game->id}/messages");

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJsonStructure([ // Comprueba que es un array de objetos
                '*' => ['time', 'type', 'user', 'message', 'timestamp']
            ])
            ->assertJsonFragment([
                'message' => 'Este es un mensaje de prueba',
                'user' => $user->name,
            ]);
    }

    /**
     * Prueba que podemos añadir un mensaje a un juego.
     * @test
     */
    public function test_can_add_message_to_game()
    {
        // Arrange: Crea un juego y un usuario
        $game = Game::factory()->create();
        $user = User::factory()->create();

        $payload = [
            'type' => 'CHAT',
            'user_id' => $user->id,
            'message' => 'Hola mundo',
        ];

        // Act: Llama al endpoint para añadir un mensaje
        $response = $this->postJson("/api/games/{$game->id}/messages", $payload);

        // Assert: Comprueba la respuesta
        $response->assertStatus(200)
            ->assertJson(['mensaje' => 'Mensaje añadido correctamente']);

        // Assert: Comprueba que el mensaje existe en la BBDD
        $this->assertDatabaseHas('messages', [
            'game_id' => $game->id,
            'user_id' => $user->id,
            'message' => 'Hola mundo',
            'type' => 'CHAT',
        ]);
    }

    /**
     * Prueba que la validación falla al añadir un mensaje sin datos.
     * @test
     */
    public function test_add_message_fails_validation_for_missing_data()
    {

        $game = Game::factory()->create();

        // Act: Llama al endpoint sin payload
        $response = $this->postJson("/api/games/{$game->id}/messages", []);

        // Assert: Comprueba los errores de validación
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type', 'user', 'message']);
    }
}
