<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\message>
 */
class MessageFactory extends Factory
{
    public function definition(): array
    {

        return [
            'type' => 'SYSTEM',
            'message' => 'ejemplo',
            // 'game_id' => function () {
            //     return Game::inRandomOrder()->first()->id;
            // },
            // 'user_id' => function () {
            //     // Coge un User al azar, o devuelve null si no hay Users.
            //     return User::inRandomOrder()->first()?->id;
            // },

        ];
    }
}
