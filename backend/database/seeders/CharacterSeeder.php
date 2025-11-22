<?php

namespace Database\Seeders;

use App\Models\Character;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $characters = [
            [
                'name' => 'Aldeano',
                'is_unique' => false,
                'description' => 'Jugador común sin habilidades especiales.',
            ],
            [
                'name' => 'Lobo',
                'is_unique' => false,
                'description' => 'Jugador malvado que elimina a otros durante la noche.',
            ],
            [
                'name' => 'Vidente',
                'is_unique' => true,
                'description' => 'Puede conocer la identidad de un jugador cada noche.',
            ],
            [
                'name' => 'Cazador',
                'is_unique' => true,
                'description' => 'Si muere, puede eliminar a otro jugador de su elección.',
            ],
            [
                'name' => 'Bruja',
                'is_unique' => true,
                'description' => 'Posee pociones para salvar o eliminar jugadores.',
            ],
            [
                'name' => 'Ladrón',
                'is_unique' => true,
                'description' => 'Puede intercambiar su personaje con otro jugador al inicio.',
            ],
            [
                'name' => 'Cupido',
                'is_unique' => true,
                'description' => 'Asigna roles de amantes a dos jugadores.',
            ],
            [
                'name' => 'Niña',
                'is_unique' => true,
                'description' => 'Observa la noche sin ser vista por los lobos.',
            ],
        ];

        foreach ($characters as $char) {
            Character::create($char);
        }
    }
}
