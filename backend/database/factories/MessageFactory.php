<?php

namespace Database\Factories;


use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Factory as FakerFactory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\message>
 */
class MessageFactory extends Factory
{

    public function definition(): array
    {
        $faker =  FakerFactory::create('es_ES');
        return [
            'type' => $faker->randomElement(['SYSTEM','GAME_MANAGER', 'MESSAGE', 'ERROR']),
            'message' => $faker->sentence(),
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
