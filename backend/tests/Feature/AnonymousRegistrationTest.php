<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Database\Seeders\RoleSeeder; 

class AnonymousRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp():void{
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_anonymous_register_not_nickname(){
        //se hace post a la ruta sin enviar datos
        $response = $this->postJson('/api/register/anonymous');

        $response->assertCreated();

        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => [
                    'id',
                    'nickname',
                    'is_anonymous',
                ],
                'token',
            ]
        ]);

        //se comprueba en base de datos y se verifica que se ha creado un usuario con is_anonimous true
        $this->assertDatabaseHas('users',[
            'is_anonymous' => true,
            'email' => null,
        ]);
    }

    public function test_anonymous_register_nickname(){
        $nick = "WolvesHunter";

        $response = $this->postJson('/api/register/anonymous', [
            'nickname' => $nick
        ]);

        $response->assertCreated();

        //se comprueba que el usuario tiene ese nombre
        $this->assertDatabaseHas('users', [
            'nickname' => $nick,
            'is_anonymous' => true,
        ]);

    }
}
