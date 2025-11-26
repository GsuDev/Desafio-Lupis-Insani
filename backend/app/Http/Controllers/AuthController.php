<?php

namespace App\Http\Controllers;

use App\Mail\RestorePasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\Role;

class AuthController extends Controller
{

    // registro de un usuario anonimo (jugador anonimo)
    public function registerAnonymous(Request $request){
        $validated = $request->validate([
            'nickname' => 'nullable|string|max:255'
        ]);

        $finalName = $validated['nickname'] ?? null;

        //si el nickname esta vacio generamos uno divertido
        if (!$finalName) {
            $adjetivos_graciosos = [
                "chirriante", "despeinado", "tambaleante", "orejudo", "cabezón",
                "desgarbado", "zarrapastroso", "mocoso", "patitieso", "despatarrado",
                "cabeza hueca", "salvaje", "alocado", "estrafalario", "ridículo",
                "extravagante", "chiflado", "bocazas", "torpe", "memo"
            ];
            
            $sustantivos_graciosos = [
                "moflete", "bigotillo", "tranco", "zarrío", "chisme", "artilugio",
                "cachivache", "trasto", "mameluco", "zangolotino", "mequetrefe",
                "papanatas", "zopenco", "mendrugo", "pringao", "calamidad",
                "desastre", "esperpento", "engendro", "galimatías"
            ];

            $adj = $adjetivos_graciosos[array_rand($adjetivos_graciosos)];
            $sust = $sustantivos_graciosos[array_rand($sustantivos_graciosos)];

            $finalName = ucfirst($adj). ' '. ucfirst($sust);
        }

        $user = User::create([

            'name' => $finalName,
            'nickname' => $finalName,
            'email' => null,
            'password' => null,
            'is_anonymous' => true,
        ]);

        $roleAnonymous = Role::where('name', 'player_anonymous')->first();
        
        if ($roleAnonymous) {
            $user->roles()->attach($roleAnonymous->id);
        }

        
        
        return response()->json($this->login($user), 201);



    }


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

        //esto de las abilities está hecho asi por el tema de gestionar los accesos del jugador anonimo
        $gameAbilities = [
            'join-game',
            'send-events',
            'read-game-state',
        ];

        
        $userAbilities = [
            'update-itself',
            'view-itself',
            'delete-itself',
        ];

        
        $adminAbilities = [
            'list-users',
            'view-user',
            'update-user',
            'delete-user',
            'assign-roles',
        ];

        
        
        $abilities = [];

        if ($user->hasRole('admin')) {
            // Admin: Todo el poder + Jugar
            $abilities = array_merge($adminAbilities, $gameAbilities);

        } elseif ($user->hasRole('player_anonymous')) {
            // Anónimo: Solo jugar
            $abilities = $gameAbilities;

        } else {
            // Usuario Normal: Su perfil + Jugar
            $abilities = array_merge($userAbilities, $gameAbilities);
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
