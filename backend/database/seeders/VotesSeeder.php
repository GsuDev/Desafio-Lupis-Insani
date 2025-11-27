<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\participant;
use App\Models\Vote;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VotesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //busco una partida existente para no invertarme el id 
        $game = Game::first();

        if (! $game) {
            return;
        }

        //busco 2 participantes de la partda
        $participants = participant::where('game_id', $game->id)->take(2)->get();

        if ($participants->count() < 2) {
            return;
        }

        $voter = $participants[0];
        $target = $participants[1];

        //se borran los votos previos de esta partda
        Vote::where('game_id', $game->id)->delete();

        Vote::create([
            'game_id' => $game->id,
            'voter_id' => $voter->id,
            'target_id' => $target->id,
            'is_day' => true,
            'day_number' => 1,
        ]);

        Vote::create([
            'game_id'    => $game->id,
            'voter_id'   => $target->id,
            'target_id'  => $voter->id,
            'is_day'     => false, 
            'day_number' => 1,
        ]);

    }
}
