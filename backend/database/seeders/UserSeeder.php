<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario system
        $admin = User::firstOrCreate(
            ['email' => 'system@system.com'],
            [
                'nickname' => 'system',
                'name' => 'system',
                'lastname' => 'system',
                'password' => Hash::make('system'), // cámbialo si quieres
                'birthdate' => '1990-01-01',
            ]
        );
        // Usuario admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'nickname' => 'admin',
                'name' => 'Administrador',
                'lastname' => 'DelJuego',
                'password' => Hash::make('Password_123'), // cámbialo si quieres
                'birthdate' => '1990-01-01',
            ]
        );

        // Usuario normal
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'nickname' => 'usuario1',
                'name' => 'Jugador',
                'lastname' => 'Prueba',
                'password' => Hash::make('Password_123'),
                'birthdate' => '2000-05-05',
            ]
        );

        // Roles
        $adminRole = Role::where('name', 'admin')->first();
        $userRole = Role::where('name', 'user')->first();

        // Asignar roles (many-to-many)
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $user->roles()->syncWithoutDetaching([$userRole->id]);
    }
}
