<?php

namespace Database\Seeders;

use App\Models\Character;
use App\Models\Game;
use App\Models\participant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ParticipantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $game = Game::find(1);
        $user1 = User::find(1);
        $user2 = User::find(2);
        $char1 = Character::find(1);
        $char2 = Character::find(2);

        // Borramos solo los participantes de esta partida para no repetir
        DB::table('participants')->where('game_id', $game->id)->delete();

        // se insertan dos participantes de prueba
        $now = now();
        DB::table('participants')->insert([
            [
                'game_id' => $game->id,
                'user_id' => $user1->id,
                'is_bot' => false,
                'is_host' => false,
                'nickname' => $user1->nickname,
                'character_id' => $char2->id,
            ],
            [
                'game_id' => $game->id,
                'user_id' => $user2->id,
                'is_bot' => false,
                'is_host' => true,
                'nickname' => $user2->nickname,
                'character_id' => $char2->id,
            ],
        ]);
        participant::factory()->count(10)->create();
    }
}
