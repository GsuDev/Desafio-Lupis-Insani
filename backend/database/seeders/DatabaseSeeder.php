<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
        ]);

        Game::factory()
            ->count(5)
            ->has(
                Message::factory()
                    ->count(20)
                    ->state(function (array $attributes, Game $game) use ($users) {
                        $userId = fake()->boolean(80) ? $users->random()->id : null; // 20 % pos de que sea anonimo

                        return ['user_id' => $userId];
                    })
            )
            ->create();
    }
}
