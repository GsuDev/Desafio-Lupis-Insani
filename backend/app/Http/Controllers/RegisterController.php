<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    private function handleImageUpload(Request $request): ?string
    {
        $imageUrl = null;

        try {
            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');

                // Creamos un nombre de archivo único
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $filename = 'perfil_'.uniqid().'_'.Str::slug($originalName).'.'.$extension;

                // Subimos los archivos a cloudinary
                $uploadedFilePath = Storage::disk('cloudinary')->putFileAs(
                    'lobos_de_castronegro/perfiles',
                    $file,
                    $filename
                );

                $imageUrl = Storage::disk('cloudinary')->url($uploadedFilePath);
            }
        } catch (\Exception $e) {
            return null;
        }

        return $imageUrl;
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
            'profile_picture' => 'nullable|file|image|max:2048',
        ], $messages);

        if ($validator->fails()) {
            // El frontend leerá esto en el bloque 'catch'
            return response()->json($validator->errors(), 422);
        }

        // Subida a cloudinary
        $imageUrl = $this->handleImageUpload($request);

        $userData = [
            'nickname' => $request->nickname,
            'name' => $request->name,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'birthdate' => $request->birthdate,
            'profile_image_url' => $imageUrl,
        ];

        $user = User::create($userData);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Usuario registrado con éxito',
        ], 201);

    }
}
