<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;


Route::post('/register', [RegisterController::class, 'register']);

// Rutas publicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/users', [UserController::class, 'store']); 


// Ruta /user protegida: Obtener los datos de usuario con sesion iniciada
Route::middleware('auth:sanctum')->get('/user', [UserController::class, 'showItself']);
// Ruta /logout protegida: Cerrar la sesion
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// ---------------------------
// Endpoints /users protegidos
// ---------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Listado → solo tokens con ability 'list-users'
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('list-users');

    // Consultar uno → 'view-user'
    Route::get('/users/{id}', [UserController::class, 'show'])
        ->middleware('view-user');

    // Actualizar → 'update-user'
    Route::put('/users/{id}', [UserController::class, 'update'])
        ->middleware('update-user');

    // Eliminar → 'delete-user'
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('delete-user');

    // Asignar roles → 'assign-roles'
    Route::post('/users/{id}/roles', [UserController::class, 'assignRoles'])
        ->middleware('assign-roles');
});


// Ruta si el user no tiene la sesion iniciada
Route::get('/nologin', function () {
    return response()->json(['success' => false, 'message' => 'Unauthorised'], 203);
});
