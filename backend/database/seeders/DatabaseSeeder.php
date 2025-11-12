<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $users = User::factory()->count(10)->create();

        Game::factory()
            ->count(5)
            ->has(
                Message::factory()
                    ->count(20)
                    ->state(function(array $attributes, Game $game) use ($users){
                        $userId = fake()->boolean(80) ? $users->random()->id : null;//20 % pos de que sea anonimo
                        return ['user_id' => $userId];
                    })
            )
            ->create();
    }

}
