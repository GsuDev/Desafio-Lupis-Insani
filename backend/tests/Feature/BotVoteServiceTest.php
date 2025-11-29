<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Game;
use App\Models\participant;
use App\Models\Vote;
use App\Models\Character; 
use App\Services\BotVoteService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BotVoteServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BotVoteService $botVoteService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->botVoteService = app(BotVoteService::class);
    }

    public function test_bots_add_votes_to_collection_manual_setup()
    {
        // arrange

        // se crea un personaje dummy para evitar el error de foreign key
        
        $character = Character::create([
            'id' => 1,
            'name' => 'Aldeano',
            'description' => 'Un aldeano normal',
            
        ]);
        
        
        $game = Game::create([
            'state' => 'on_course',
            'url'   => 'partida-test-123',
        ]);

        // se crean participantes humanos
        $human1 = participant::create([
            'game_id'      => $game->id,
            'user_id'      => null, 
            'is_bot'       => false,
            'is_host'      => true,
            'nickname'     => 'Humano 1',
            'character_id' => $character->id, 
        ]);

        $human2 = participant::create([
            'game_id'      => $game->id,
            'user_id'      => null,
            'is_bot'       => false,
            'is_host'      => false,
            'nickname'     => 'Humano 2',
            'character_id' => $character->id,
        ]);

        // se crean los bots
        $bots = [];
        for ($i = 1; $i <= 3; $i++) {
            $bots[] = participant::create([
                'game_id'      => $game->id,
                'user_id'      => null,
                'is_bot'       => true,
                'is_host'      => false,
                'nickname'     => "Bot $i",
                'character_id' => $character->id,
            ]);
        }
        
        $botsCollection = collect($bots);

        // hay que simular los votos de los humanos
        $humanVotes = collect([]);
        
        $humanVotes->push(new Vote([
            'game_id'    => $game->id,
            'voter_id'   => $human1->id,
            'target_id'  => $bots[0]->id,
            'is_day'     => true,
            'day_number' => 1
        ]));

        $humanVotes->push(new Vote([
            'game_id'    => $game->id,
            'voter_id'   => $human2->id,
            'target_id'  => $bots[0]->id,
            'is_day'     => true,
            'day_number' => 1
        ]));

        // act
        $resultVotes = $this->botVoteService->applyBotVotes(
            $humanVotes, 
            $game->id, 
            'day', 
            1
        );

        
        $this->assertCount(5, $resultVotes, "El total de votos debería ser 5 (2 humanos + 3 bots)");

        $botVotesGenerated = $resultVotes->slice(2); 

        foreach ($botVotesGenerated as $vote) {
            $isBotVoter = $botsCollection->contains('id', $vote->voter_id);
            $this->assertTrue($isBotVoter, "El voto extra debe pertenecer a un bot");
            
            $this->assertDatabaseMissing('votes', [
                'voter_id' => $vote->voter_id,
                'day_number' => 1
            ]);
        }
    }
}