<?php

namespace Database\Factories;

use App\Models\User;
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
        $user = User::factory()->create();

        return [
            // Por defecto, crea un jugador real (no un bot)
            'game_id' => 1,
            'user_id' => $user->id,
            'is_host' => false,
            'is_bot' => false,
            'nickname' => $user->nickname, // Asigna el nickname del usuario creado
            'character_id' => null,
        ];

    }
}
