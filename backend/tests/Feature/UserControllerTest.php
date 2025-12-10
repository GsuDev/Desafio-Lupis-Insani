<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear rol
        Role::factory()->create(['id' => 2, 'name' => 'user']);
        Role::factory()->create(['id' => 1, 'name' => 'admin']);

        // Crear usuario de prueba
        $this->user = User::factory()->create();
        $this->user->roles()->attach(2);

        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach(1);
    }

    // ==================== INDEX ====================
    public function test_index_returns_all_users()
    {
        User::factory()->count(5)->create();
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['list-users'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuarios recuperados correctamente',
            ])
            ->assertJsonStructure([
                'data' => [
                    'users' => [
                        '*' => [
                            'id',
                            'nickname',
                            'email',
                            'name',
                            'lastname',
                            'birthdate',
                            'profile_url',
                        ],
                    ],
                ],
            ]);
    }

    // ==================== STORE ====================
    public function test_store_creates_user_with_valid_data()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test')->plainTextToken;

        $userData = [
            'nickname' => 'testuser',
            'name' => 'Test',
            'lastname' => 'User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'birthdate' => '1990-01-01',
            'profile_url' => null,
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario creado',
            ]);

        $this->assertDatabaseHas('users', [
            'nickname' => 'testuser',
            'email' => 'test@example.com',
        ]);
    }

    public function test_store_fails_with_missing_required_fields()
    {
        $userData = [
            'nickname' => 'testuser',
            'email' => 'test@example.com',
            // Falta name, lastname, password, birthdate
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422);
    }

    public function test_store_fails_with_duplicate_email()
    {
        $existingUser = User::factory()->create(['email' => 'existing@example.com']);

        $userData = [
            'nickname' => 'newuser',
            'name' => 'New',
            'lastname' => 'User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'birthdate' => '1990-01-01',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422);
    }

    public function test_store_fails_with_short_password()
    {
        $userData = [
            'nickname' => 'testuser',
            'name' => 'Test',
            'lastname' => 'User',
            'email' => 'test@example.com',
            'password' => 'pass',
            'birthdate' => '1990-01-01',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(422);
    }

    // ==================== REGISTER ====================
    public function test_register_creates_user_with_valid_data()
    {
        $userData = [
            'nickname' => 'registeruser',
            'name' => 'Register',
            'lastname' => 'User',
            'email' => 'register@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'birthdate' => '1990-01-01',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'nickname' => 'registeruser',
            'email' => 'register@example.com',
        ]);
    }

    public function test_register_fails_with_mismatched_passwords()
    {
        $userData = [
            'nickname' => 'registeruser',
            'name' => 'Register',
            'lastname' => 'User',
            'email' => 'register@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password456',
            'birthdate' => '1990-01-01',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
    }

    public function test_register_fails_with_duplicate_nickname()
    {
        User::factory()->create(['nickname' => 'existingnickname']);

        $userData = [
            'nickname' => 'existingnickname',
            'name' => 'Register',
            'lastname' => 'User',
            'email' => 'register@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'birthdate' => '1990-01-01',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
    }

    public function test_register_fails_with_invalid_email()
    {
        $userData = [
            'nickname' => 'registeruser',
            'name' => 'Register',
            'lastname' => 'User',
            'email' => 'invalid-email',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'birthdate' => '1990-01-01',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(422);
    }

    // ==================== SHOW ====================
    public function test_show_returns_user_by_id()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['view-user'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Datos del usuario recuperados correctamente',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'nickname' => $user->nickname,
                        'email' => $user->email,
                    ],
                ],
            ]);
    }

    public function test_show_returns_404_for_nonexistent_user()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['view-user'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/users/99999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Usuario no encontrado',
            ]);
    }

    // ==================== SHOW ITSELF ====================
    public function test_show_itself_returns_authenticated_user()
    {
        $user = User::factory()->create();
        $user->roles()->attach(2);
        $token = $user->createToken('test', ['view-itself'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Datos del usuario actual recuperados correctamente',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'email' => $user->email,
                    ],
                ],
            ]);
    }

    public function test_show_itself_returns_401_when_not_authenticated()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    // ==================== UPDATE ====================
    public function test_update_user_with_valid_data()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['update-user'])->plainTextToken;

        $userData = [
            'nickname' => 'updateduser',
            'name' => 'Updated',
            'lastname' => 'User',
            'email' => 'updated@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'birthdate' => '1995-05-15',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/users/{$user->id}", $userData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Datos del usuario actualizados correctamente',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'nickname' => 'updateduser',
            'email' => 'updated@example.com',
        ]);
    }

    public function test_update_user_fails_with_nonexistent_id()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['update-user'])->plainTextToken;

        $userData = [
            'nickname' => 'updateduser',
            'name' => 'Updated',
            'lastname' => 'User',
            'email' => 'updated@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'birthdate' => '1995-05-15',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/users/99999', $userData);

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Usuario no encontrado',
            ]);
    }

    // ==================== UPDATE ITSELF ====================
    public function test_update_itself_updates_authenticated_user()
    {
        $user = User::factory()->create();
        $user->roles()->attach(2);
        $token = $user->createToken('test', ['update-itself'])->plainTextToken;

        $userData = [
            'nickname' => 'updateduser',
            'name' => 'Updated',
            'lastname' => 'User',
            'email' => 'updated@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
            'birthdate' => '1995-05-15',
        ];

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/users', $userData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Datos del usuario actualizados correctamente',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'nickname' => 'updateduser',
        ]);
    }

    // ==================== DESTROY ====================
    public function test_destroy_deletes_user()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['delete-user'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario eliminado correctamente',
            ]);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_destroy_fails_with_nonexistent_id()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['delete-user'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson('/api/users/99999');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Usuario no encontrado',
            ]);
    }

    // ==================== DESTROY ITSELF ====================
    public function test_destroy_itself_deletes_authenticated_user()
    {
        $user = User::factory()->create();
        $user->roles()->attach(2);
        $token = $user->createToken('test', ['delete-itself'])->plainTextToken;
        $userId = $user->id;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson('/api/users');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Usuario eliminado correctamente',
            ]);

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    // ==================== ASSIGN ROLES ====================
    public function test_assign_roles_adds_role_to_user()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['assign-roles'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/users/{$user->id}/roles", [
                'roles' => 2,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles del usuario actualizados correctamente',
            ]);

        $this->assertTrue($user->refresh()->roles()->wherePivot('role_id', 2)->exists());
    }

    public function test_assign_roles_fails_with_invalid_role()
    {
        $user = User::factory()->create();
        $admin = User::factory()->create();
        $admin->roles()->attach(1);
        $token = $admin->createToken('test', ['assign-roles'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/users/{$user->id}/roles", [
                'roles' => 'invalid',
            ]);

        $response->assertStatus(304);
    }

    // ==================== UPDATE PASSWORD ====================
    public function test_update_password_with_correct_old_password()
    {
        $password = 'oldpassword123';
        $user = User::factory()->create([
            'password' => Hash::make($password),
        ]);
        $token = $user->createToken('test', ['update-itself'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/users/password', [
                'oldPassword' => $password,
                'password' => 'newpassword123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'La contraseña ha sido cambiada correctamente',
            ]);

        $this->assertTrue(Hash::check('newpassword123', $user->refresh()->password));
    }

    public function test_update_password_fails_with_incorrect_old_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
        ]);
        $token = $user->createToken('test', ['update-itself'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/users/password', [
                'oldPassword' => 'wrongpassword',
                'password' => 'newpassword123',
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Contraseña incorrecta',
            ]);
    }

    public function test_update_password_fails_with_short_new_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
        ]);
        $token = $user->createToken('test', ['update-itself'])->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/users/password', [
                'oldPassword' => 'oldpassword123',
                'password' => 'short',
            ]);

        $response->assertStatus(422);
    }

    public function test_update_password_fails_when_not_authenticated()
    {
        $response = $this->putJson('/api/users/password', [
            'oldPassword' => 'oldpassword123',
            'password' => 'newpassword123',
        ]);

        $response->assertStatus(401);
    }
}
