<?php

namespace Tests\Feature;

use App\Http\Controllers\VoteController;
use App\Models\Game;
use App\Models\Participant;
use App\Models\State;
use App\Models\Votation;
use App\Models\Vote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Tests\TestCase;

class ResolveVotingTest extends TestCase
{
    // use RefreshDatabase; // Borra la BD después de cada test

    protected $game;
    protected $votation;
    protected $alcaldeState;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup común: Creamos Juego y Estado Alcalde
        $this->game = Game::factory()->create();

        // Creamos el estado con el nombre EXACTO que busca tu controlador
        $this->alcaldeState = State::factory()->create(['name' => 'alcalde']);
    }

    /** @test */
    public function it_resolves_voting_correctly_with_simple_majority()
    {
        // Escenario: 3 jugadores. 2 votan a A, 1 vota a B. Gana A.
        $participants = Participant::factory()->count(3)->create(['game_id' => $this->game->id]);

        $victim = $participants[0];
        $survivor = $participants[1];
        $voter = $participants[2];

        // Crear la votación (Día 1)
        $votation = Votation::create([
            'game_id' => $this->game->id,
            'is_day' => true,
            'day_number' => 1,
            'is_closed' => false
        ]);

        // Votos: 2 votos para la victima, 1 para el superviviente
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $survivor->id, 'target_id' => $victim->id]);
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $voter->id, 'target_id' => $victim->id]);
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $victim->id, 'target_id' => $survivor->id]);

        // EJECUTAR LA FUNCIÓN
        $controller = new VoteController();
        $response = $controller->resolveVoting($this->game->id, 'day', 1);

        // ASERCIONES
        $this->assertEquals(200, $response->getStatusCode());

        $data = $response->getData(true); // true para array asociativo

        $this->assertTrue($data['success']);
        $this->assertEquals($victim->id, $data['data']['resolved_candidate_id']);
        $this->assertEquals(2, $data['data']['votes_count']);
        $this->assertEquals('none', $data['data']['tie_method']);
    }

    /** @test */
    public function mayor_vote_counts_double_during_day()
    {
        // Escenario: El Alcalde vota a A (1 voto x 2 = 2 puntos).
        // Dos aldeanos votan a B (1+1 = 2 puntos).
        // Resultado esperado: EMPATE (2 vs 2).
        // SIN ALCALDE ganaría B (2 vs 1). Probamos que el voto vale doble.

        $mayor = Participant::factory()->create(['game_id' => $this->game->id]);
        $villager1 = Participant::factory()->create(['game_id' => $this->game->id]);
        $villager2 = Participant::factory()->create(['game_id' => $this->game->id]);

        $candidateA = Participant::factory()->create(['game_id' => $this->game->id]);
        $candidateB = Participant::factory()->create(['game_id' => $this->game->id]);

        // Asignar estado de alcalde
        $mayor->states()->attach($this->alcaldeState->id);

        $votation = Votation::create([
            'game_id' => $this->game->id,
            'is_day' => true, // ES DÍA
            'day_number' => 1,
        ]);

        // Alcalde vota a Candidato A (Vale 2)
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $mayor->id, 'target_id' => $candidateA->id]);

        // Aldeanos votan a Candidato B (Total 2)
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $villager1->id, 'target_id' => $candidateB->id]);
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $villager2->id, 'target_id' => $candidateB->id]);

        // Ejecutar
        $controller = new VoteController();
        $response = $controller->resolveVoting($this->game->id, 'day', 1);
        $data = $response->getData(true);

        // Aserciones
        $this->assertEquals(2, $data['data']['votes_count']); // El máximo de votos fue 2
        $this->assertEquals('coinflip', $data['data']['tie_method']); // Debe ser empate porque 2 (alcalde) == 2 (aldeanos)
    }

    /** @test */
    public function mayor_vote_is_NOT_double_during_night()
    {
        // Escenario: Igual que el anterior, pero es DE NOCHE.
        // Alcalde vota A (1 voto). Aldeanos votan B (2 votos).
        // Resultado esperado: Gana B.

        $mayor = Participant::factory()->create(['game_id' => $this->game->id]);
        $villager1 = Participant::factory()->create(['game_id' => $this->game->id]);
        $villager2 = Participant::factory()->create(['game_id' => $this->game->id]);

        $candidateA = Participant::factory()->create(['game_id' => $this->game->id]);
        $candidateB = Participant::factory()->create(['game_id' => $this->game->id]);

        $mayor->states()->attach($this->alcaldeState->id);

        $votation = Votation::create([
            'game_id' => $this->game->id,
            'is_day' => false, // ES NOCHE
            'day_number' => 1,
        ]);

        Vote::create(['votation_id' => $votation->id, 'voter_id' => $mayor->id, 'target_id' => $candidateA->id]);
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $villager1->id, 'target_id' => $candidateB->id]);
        Vote::create(['votation_id' => $votation->id, 'voter_id' => $villager2->id, 'target_id' => $candidateB->id]);

        $controller = new VoteController();
        $response = $controller->resolveVoting($this->game->id, 'night', 1);
        $data = $response->getData(true);

        // Gana B con 2 votos. A solo tiene 1 (porque alcalde no cuenta doble)
        $this->assertEquals($candidateB->id, $data['data']['resolved_candidate_id']);
        $this->assertEquals(2, $data['data']['votes_count']);
    }

    /** @test */
    public function it_returns_404_if_no_votes_exist()
    {
        // Creamos votación pero NO votos
        Votation::create([
            'game_id' => $this->game->id,
            'is_day' => true,
            'day_number' => 1,
        ]);

        $controller = new VoteController();
        $response = $controller->resolveVoting($this->game->id, 'day', 1);

        $this->assertEquals(404, $response->getStatusCode());
    }
}
