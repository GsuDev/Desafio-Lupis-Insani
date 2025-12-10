<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Estado clasicos del juego de los lobos, son estados de prueba, no sabemos los que se pondran finalmente exactamente
        $states = [
            [
                'name' => 'DEAD',
                'description' => 'Muerto, morido o matado.',
            ],
            [
                'name' => 'protegido',
                'description' => 'Protegido por el Salvado (o la Bruja) esta noche. No puede morir atacado por los lobos.',
            ],
            [
                'name' => 'silenciado',
                'description' => 'Ha sido silenciado (por ejemplo, por el Anciano o reglas especiales). No puede hablar ni votar en la fase de día.',
            ],
            [
                'name' => 'hipnotizado',
                'description' => 'Bajo el influjo del Flautista. Si todos los vivos están hipnotizados, el Flautista gana.',
            ],
            [
                'name' => 'COUNCIL',
                'description' => 'Es el Alguacil del pueblo. Su voto vale doble en caso de empate.',
            ],
        ];

        DB::table('states')->insert($states);
    }
}
