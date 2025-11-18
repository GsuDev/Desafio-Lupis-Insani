<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\participant>
 */
class ParticipantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Por defecto, crea un jugador real (no un bot)
            'game_id' => GameFactory::factory(),
            'user_id' => UserFactory::factory(),
            'is_bot' => false,
            'bot_name' => null,
            'character_id' => CharacterFactory::factory(),
        ];
    }
}
