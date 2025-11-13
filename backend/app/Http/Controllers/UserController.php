<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::with('roles')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nickname' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'birthdate' => 'required|date',
            'profile_url' => 'nullable|string',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        try {
            $user->roles()->attach(2);
        } catch (Exception) {
            return response()->json(['message' => 'No hay roles para asignar'], 500);
        }

        return response()->json($user->load('roles'), 201);
    }

    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);

        if (!$user) {
            return response()->json($user);
        }

        return response()->json($user);
    }

    // Método para obtener el usuario de quien lo solicita
    public function showItself(Request $request)
    {
        $user = $request->user();

        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nickname' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'birthdate' => 'required|date',
            'profile_image_url' => 'nullable|string',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }

    public function assignRoles(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'roles' => 'required|int',
        ]);

        try {
            $user->roles()->attach($validated['roles']);
        } catch (Exception) {
            return response()->json(["success" => false,'message' => 'No se ha podido añadir el rol'], 304);
        }

        return response()->json($user->load('roles'));
    }

    
}
