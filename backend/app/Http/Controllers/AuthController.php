<?php

namespace App\Http\Controllers;

use App\Mail\RestorePasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;


class AuthController extends Controller
{

    

    // Login y creación de token
    public function publicLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas',
                'data' => null,
            ], 401);
        }

        return response()->json($this->login($user), 200);
    }

    // Logout (revocar token actual)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente',
            'data' => null,
        ], 200);
    }

    public static function login($user)
    {
        // En login NO se debe volver a checkear el hash
        // porque ya se hizo en publicLogin()

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
        }elseif ($user->hasRole('player_anonymous')) {
            $abilities = [
                'join-game', 
                'send-events',
                'read-game-state',
            ];
        }else {
            $abilities = [
                'update-itself',
                'view-itself',
                'delete-itself',
            ];
        }
        

        $token = $user->createToken('auth-token', $abilities)->plainTextToken;

        return [
            'success' => true,
            'message' => 'Sesión iniciada correctamente',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],

        ];
    }

    public function restorePassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'El email no está registrado',
                'data' => null,
            ], 404);
        }

        // 1. Crear token de Sanctum
        $token = $user->createToken('auth-token', ['reset-password'])->plainTextToken;

        // 2. Borrar todos los demás tokens excepto este
        $user->tokens()->delete();

        // 3. Enviar correo al usuario
        Mail::to($user->email)->send(new RestorePasswordMail($token));

        return response()->json([
            'success' => true,
            'message' => 'Se ha enviado un correo para restaurar la contraseña',
            'data' => null,
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        // 4. Obtener usuario
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'El usuario no existe',
                'data' => null,
            ], 404);
        }

        // 5. Cambiar contraseña
        $user->password = Hash::make($validated['password']);
        $user->save();

        // 6. Borrar TODOS los tokens (logout global)
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'La contraseña ha sido restablecida correctamente',
            'data' => null,
        ], 200);
    }
}
