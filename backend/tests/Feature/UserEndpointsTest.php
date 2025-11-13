<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([

            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }

    public function test_can_register_publicly()
    {
        $response = $this->postJson('/api/users', [
            'nickname' => 'Test Icles',
            'name' => 'Test User',
            'lastname' => 'Test Test',
            'email' => 'test@example.com',
            'password' => 'password',
            'birthdate' => '2003-05-12T00:00:00.000000Z',

        ]);

        $response->assertCreated()
            ->assertJsonStructure(['id',
                'nickname',
                'name',
                'lastname',
                'email',
                'birthdate', ]);
    }

    public function test_user_with_list_users_can_list_users()
    {
        $user = User::factory()->create();
        $token = $user->createToken('t', ['list-users'])->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/users');

        $response->assertOk();
    }

    public function user_without_list_users_cannot_list_users()
    {
        $user = User::factory()->create();
        $token = $user->createToken('t', [])->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/users');

        $response->assertForbidden();
    }

    public function test_user_with_view_user_can_view_any_user()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $token = $user->createToken('t', ['view-user'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/users/{$other->id}");

        $response->assertOk()
            ->assertJson(['id' => $other->id]);
    }

    public function test_user_with_view_itself_can_only_view_their_own_profile()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $token = $user->createToken('t', ['view-itself'])->plainTextToken;

        // Ver su propio perfil → OK
        $response = $this->withToken($token)->getJson("/api/users/{$user->id}");
        $response->assertOk()
            ->assertJson(['id' => $user->id]);

        // Intentar ver otro perfil → 403
        $response2 = $this->withToken($token)->getJson("/api/users/{$other->id}");
        $response2->assertForbidden();
    }

    public function test_user_with_update_user_can_update_any_user()
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $token = $user->createToken('t', ['update-user'])->plainTextToken;

        $response = $this->withToken($token)->putJson("/api/users/{$target->id}", [
            'nickname' => 'Updated Name',
            'name' => 'Test User',
            'lastname' => 'Test Test',
            'email' => 'test@example.com',
            'password' => 'password',
            'birthdate' => '2003-05-12T00:00:00.000000Z',
        ]);

        $response->assertOk();
    }

    public function test_user_without_update_user_cannot_update_users()
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $token = $user->createToken('t', [])->plainTextToken;

        $response = $this->withToken($token)->putJson("/api/users/{$target->id}", [
            'name' => 'Hack Attempt',
        ]);

        $response->assertForbidden();
    }

    public function test_user_with_delete_user_can_delete_users()
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $token = $user->createToken('t', ['delete-user'])->plainTextToken;

        $response = $this->withToken($token)->deleteJson("/api/users/{$target->id}");
        $response->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_user_with_assign_roles_can_assign_roles_to_other_users()
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        print_r('ROLES EN LA BBDD'.Role::all());

        $token = $user->createToken('t', ['assign-roles'])->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/users/{$target->id}/roles", [
            'roles' => 22,
        ]);

        $response->assertOk();
    }

    public function test_user_without_assign_roles_cannot_assign_roles()
    {
        $user = User::factory()->create();
        $target = User::factory()->create();

        $token = $user->createToken('t', [])->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/users/{$target->id}/roles", [
            'roles' => 22,
        ]);

        $response->assertForbidden();
    }
}
