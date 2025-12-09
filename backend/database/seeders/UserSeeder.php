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
        $system = User::firstOrCreate(
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
        $anonymous = User::firstOrCreate(
            ['email' => null],
            [
                'nickname' => 'cabeza alberca',
                'name' => 'cabeza alberca',
                'lastname' => null,
                'password' => null,
                'birthdate' => null,
            ]
        );

        // Roles
        $adminRole = Role::where('name', 'admin')->first();
        $userRole = Role::where('name', 'user')->first();
        $anonymousRole = Role::where('name', 'player_anonymous')->first();

        // Asignar roles (many-to-many)
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $user->roles()->syncWithoutDetaching([$userRole->id]);
        $system->roles()->syncWithoutDetaching([$adminRole->id]);
        $anonymous->roles()->syncWithoutDetaching([$anonymousRole->id]);
        User::factory()->count(20)->create();
    }
}
