<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;
  
   public function test_successful_registration(): void
    {
        // Fake del storage (para que no intente subir a Cloudinary real)
        Storage::fake('cloudinary');

        // Datos de prueba
        $userData = [
            'nickname' => 'TestUser',
            'name' => 'Test',
            'lastname' => 'User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'birthdate' => '2000-01-01',
            // profile_picture es opcional, así que lo dejamos null o lo omitimos
        ];


        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201);

        $response->assertJsonStructure([
            'user' => ['id', 'nickname', 'email'],
            'token',
            'message'
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'nickname' => 'TestUser',
            'name' => 'Test',
            'lastname' => 'User',
        ]);

        // El token existe?
        $this->assertNotEmpty($response->json('token'));
    }

    //Test validacion falla si falta el email
    public function test_registration_fails_without_email(): void
    {
        $userData = [
            'nickname' => 'TestUser',
            'name' => 'Test',
            'lastname' => 'User',
            // email falta
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

}
