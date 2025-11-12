<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::post('/users', [UserController::class, 'store']); // registro público

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

Route::get('/nologin', function () {
    return response()->json(['success' => false, 'message' => 'Unauthorised'], 203);
});
