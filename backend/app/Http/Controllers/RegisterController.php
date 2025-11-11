<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\User;

class RegisterController extends Controller
{

    private function handleImageUpload(Request $request): ?string // significa que puede devolver string o null
    {
        $image = null;
        try {
            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');

                //creamos un nombre de archivo unico
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $filename = 'perfil_' . uniqid() . '_' . Str::slug($originalName) . '.' . $extension;
                //Subimos los archivos a cloudinary
                $uploadedFilePath = Storage::disk('cloudinary')->putFileAs('lobos_de_castronegro/perfiles', $file, $filename);
                $imageUrl = Storage::disk('cloudinary')->url($uploadedFilePath);
            }
        }catch(\Exception $e){
            return null;
        }

        return $imageUrl;
    }
    
    public function register(Request $request)
    {
        //Validacion
        $messages = [
            'nickname.required'     => 'El nickname es obligatorio.',
            'nickname.unique'       => 'Este nickname ya está en uso.',
            'email.required'        => 'El email es obligatorio.',
            'email.email'           => 'El formato del email no es válido.',
            'email.unique'          => 'Este email ya está registrado.',
            'password.required'     => 'La contraseña es obligatoria.',
            'password.min'          => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed'    => 'Las contraseñas no coinciden.',
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.max'   => 'La imagen no puede pesar más de 2MB.',
        ];


        $validator = Validator::make($request->all(), [
            'nickname'              => 'required|string|max:255|unique:users', // Importante unique:users comprueba duplicados
            'name'                  => 'required|string|max:255',
            'lastname'              => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users', //  email y unique
            'password'              => 'required|string|min:8|confirmed', // 'confirmed' comprueba que password_confirmation coincida
            'birthday'              => 'nullable|date',  //comprobar despues
            'profile_picture'       => 'nullable|file|image|max:2048',
        ], $messages);

      if ($validator->fails()) {
        //El fronted leerá esto en el bloque 'catch'.
        return response()->json($validator->errors(), 422);
      }

      //subida a cloudinary
      $imageUrl = $this->handleImageUpload($request);

      

      $userData = [
        'nickname' => $request->nickname,
        'name' => $request->name,
        'lastname' => $request->lastname,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'birthday' => $request->birthday,
        'profile_url' => $imageUrl, //temporal

      ];

      //esto se descomentará cuando el Modelo user esté listo, es solo para prueba

      /*
      $user = User::create($userData);

      $token = $user->createToken('auth_token')->plainTextToken;

      return response()->json([
        'user' => $user,
        'token' => $token,
        'message' => 'Usuario registrado con exito'
      ]);
      */

       
    }
    
}  
