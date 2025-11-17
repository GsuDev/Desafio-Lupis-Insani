<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Game;
use App\Models\Character;
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
        DB::table('game_participants')->insert([
            [
                'game_id' => $game->id,
                'user_id' => $user1->id,
                'is_bot' => false,
                'bot_name' => null,
                'character_id' => $char1->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'game_id' => $game->id,
                'user_id' => $user2->id,
                'is_bot' => false,
                'bot_name' => null,
                'character_id' => $char2->id,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
