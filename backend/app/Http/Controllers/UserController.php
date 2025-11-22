<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::with('roles')->get();

            return response()->json([
                'success' => true,
                'message' => 'Usuarios recuperados correctamente',
                'data' => ['users' => $users],
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'No se han encontrado usuarios',
                'data' => null,
            ], 404);
        }
    }

    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'nickname' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'birthdate' => 'required|date',
            'profile_url' => 'nullable|string',
        ]);
        if ($validated->fails()) {

            return response()->json([
                'success' => false,
                'message' => $validated->errors(),
                'data' => null,
            ], 422);
        }

        $userData = [
            'nickname' => $request->nickname,
            'name' => $request->name,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthdate' => $request->birthdate,
            'profile_url' => null,
        ];

        $userData['password'] = Hash::make($userData['password']);

        $user = User::create($userData);

        try {
            $user->roles()->attach(2);
        } catch (Exception) {
            return response()->json([
                'success' => false,
                'message' => 'No existen roles para asignar',
                'data' => null,
            ], 500);
        }
        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado',
            'data' => ['user' => $user],
        ], 201);
    }

    public function register(Request $request)
    {

        // Validación
        $messages = [
            'nickname.required' => 'El nickname es obligatorio.',
            'nickname.unique' => 'Este nickname ya está en uso.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El formato del email no es válido.',
            'email.unique' => 'Este email ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.max' => 'La imagen no puede pesar más de 2MB.',
        ];

        $validator = Validator::make($request->all(), [
            'nickname' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'birthdate' => 'nullable|date',
            // 'profile_picture' => 'nullable|file|image|max:2048',
        ], $messages);

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => $validator->errors(),
                'data' => null,
            ], 422);
        }

        // Subida a cloudinary
        $imageUrl = CloudController::handleImageUpload($request);

        $userData = [
            'nickname' => $request->nickname,
            'name' => $request->name,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthdate' => $request->birthdate,
            'profile_url' => $imageUrl,
        ];

        $user = User::create($userData);

        try {
            $user->roles()->attach(2);
        } catch (Exception) {
            return response()->json([
                'success' => false,
                'message' => 'No existen roles para asignar',
                'data' => null,
            ], 500);
        }

        return Response()->json(AuthController::login($user));
    }

    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Datos del usuario recuperados correctamente',
            'data' => ['user' => $user],
        ], 200);
    }

    // Método para obtener el usuario de quien lo solicita
    public function showItself(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Datos del usuario actual recuperados correctamente',
            'data' => ['user' => $user],
        ], 200);
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::with('roles')->findOrFail($id);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }
        // Validación
        $messages = [
            'nickname.required' => 'El nickname es obligatorio.',
            'nickname.unique' => 'Este nickname ya está en uso.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El formato del email no es válido.',
            'email.unique' => 'Este email ya está registrado.',
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.max' => 'La imagen no puede pesar más de 2MB.',
        ];

        $validated = Validator::make($request->all(), [
            'nickname' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'birthdate' => 'nullable|date',
            // 'profile_picture' => 'nullable|file|image|max:2048',
        ], $messages);

        if ($validated->fails()) {

            return response()->json([
                'success' => false,
                'message' => $validated->errors(),
                'data' => null,
            ], 422);
        }

        $user->update($validated->validated());

        return response()->json([
            'success' => true,
            'message' => 'Datos del usuario actualizados correctamente',
            'data' => ['user' => $user],
        ], 200);
    }

    public function updateItself(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }
        // Validación
        $messages = [
            'nickname.required' => 'El nickname es obligatorio.',
            'nickname.unique' => 'Este nickname ya está en uso.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El formato del email no es válido.',
            'email.unique' => 'Este email ya está registrado.',
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.max' => 'La imagen no puede pesar más de 2MB.',
        ];

        $validated = Validator::make($request->all(), [
            'nickname' => [
                'required',
                'string',
                'max:255',

            ],
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
            ],
            'birthdate' => 'nullable|date',
            'profile_picture' => 'nullable|image|max:2048',
        ], $messages);

        if ($validated->fails()) {

            return response()->json([
                'success' => false,
                'message' => $validated->errors(),
                'data' => null,
            ], 422);
        }

        
        $dataToUpdate = $validated->validated();

        
        if ($request->hasFile('profile_picture')) {

            $imageUrl = CloudController::handleImageUpload($request);

            if ($imageUrl) {

                $dataToUpdate['profile_url'] = $imageUrl;
            }
        }

        $user->update($dataToUpdate);

        return response()->json([
            'success' => true,
            'message' => 'Datos del usuario actualizados correctamente',
            'data' => ['user' => $user],
        ], 200);
    }

    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente',
            'data' => null,
        ], 200);
    }

    public function destroyItself(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado correctamente',
            'data' => null,
        ], 200);
    }

    public function assignRoles(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
                'data' => null,
            ], 404);
        }
        $validated = Validator::make($request->all(), [
            'roles' => 'required|int',
        ]);

        try {
            $user->roles()->attach($validated->validated()['roles']);
        } catch (Exception) {
            return response()->json(['success' => false, 'message' => 'No se ha podido añadir el rol', 'data' => null], 304);
        }
        $user->load('roles');

        return response()->json([
            'success' => true,
            'message' => 'Roles del usuario actualizados correctamente',
            'data' => ['user' => $user],
        ], 200);
    }

    public function updatePassword(Request $request)
    {

        $user = $request->user();

        $validated = Validator::make($request->all(), [
            'oldPassword' => 'required|string|min:8',
            'password' => 'required|string|min:8',
        ]);
        if ($validated->fails()) {

            return response()->json([
                'success' => false,
                'message' => $validated->errors(),
                'data' => null,
            ], 422);
        }
        // Comprobar contraseña antigua
        if (! Hash::check($request['oldPassword'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Contraseña incorrecta',
                'data' => null,
            ], 400);
        }

        // Hashear nueva contraseña
        $user->password = Hash::make($request['password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'La contraseña ha sido cambiada correctamente',
            'data' => null,
        ], 200);
    }
}
