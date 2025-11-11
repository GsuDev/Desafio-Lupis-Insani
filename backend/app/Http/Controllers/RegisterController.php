<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class RegisterController extends Controller
{

    public function register(Request $request)
    {
        //Validacion
    $validator = Validator::make($request->all(), [
        'nickname'              => 'required|string|max:255|unique:users', // Importante unique:users comprueba duplicados
            'name'                  => 'required|string|max:255',
            'lastname'              => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users', //  email y unique
            'password'              => 'required|string|min:8|confirmed', // 'confirmed' comprueba que password_confirmation coincida
            'birthday'              => 'nullable|date',  //comprobar despues
            'profile_url'           => 'nullable|string|url', 
    ]);

      if ($validator->fails()) {
        //El fronted leerá esto en el bloque 'catch'.
        return response()->json($validator->errors(), 422);
      }

      $userData = [
        'nickname' => $request->nickname,
        'name' => $request->name,
        'lastname' => $request->lastname,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'birthday' => $request->birthday,
        'profile_url' => $request->profile_url, //temporal

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
