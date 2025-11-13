<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Login y creación de token
    public function login(Request $request)
    {
          $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();
        $this->publicLogin($user);

    }

    // Logout (revocar token actual)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }

    public static function publicLogin($user){
      
        

        if (! $user || ! Hash::check($user['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Definir abilities según rol
        $abilities = [];

        if ($user->hasRole('admin')) {
            $abilities = [
                'list-users',
                'view-user',
                'update-user',
                'delete-user',
                'assign-roles',

            ];
        } else {
            $abilities = [
                'update-itself',
                'view-itself',
                'delete-itself',
            ];
        }

        $token = $user->createToken('auth-token', $abilities)->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
