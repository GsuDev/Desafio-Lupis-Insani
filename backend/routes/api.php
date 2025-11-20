<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --------------
// Rutas públicas
// --------------

//Ruta temporal para probar la asignacion de bots
//Debug
Route::post('/games/{game}/bots', [GameController::class,'testAssignBots']);

Route::post('/login', [AuthController::class, 'publicLogin']);
Route::post('/users', [UserController::class, 'store']);
Route::post('/register', [RegisterController::class, 'register']);
// Solicitar recuperación de contraseña
Route::post('/restore-password', [AuthController::class, 'restorePassword']);

// ------------------------------------------------------------------------

// ----------------------------
// Rutas protegidas de usuarios
// ----------------------------

// Ruta /user protegida: Obtener los datos de usuario con sesion iniciada
Route::middleware('auth:sanctum')->get('/user', [UserController::class, 'showItself']);

// Ruta /logout protegida: Cerrar la sesion
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Ruta /reset-password: Nueva contraseña al recuperar
Route::middleware('auth:sanctum')->post('/reset-password', [AuthController::class, 'reset-password']);

// ------------------------------------------------------------------------

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

    // Actualizar contraseña → 'update-user'
    Route::put('/users/{id}/change-password', [UserController::class, 'updatePassword'])
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
    return response()->json(['success' => false, 'message' => 'Unauthorised', 'data' => null], 203);
});

// ------------------------------------------------------------------------

// ----------------------------
// Rutas protegidas de partidas
// ----------------------------

// POST /api/games -> GameController@createGame
Route::post('/games', [GameController::class, 'createGame']);

// GET /api/games -> GameController@getGames
Route::get('/games', [GameController::class, 'getGames']);

// GET /api/games/url/{url} -> GameController@getGameByURL
Route::get('/games/url/{url}', [GameController::class, 'getGameByURL']);

// Agrupo las rutas que dependen de un {game}
Route::prefix('/games/{game}')->group(function () {

    // GET /api/games/{game} -> GameController@getGame
    Route::get('/', [GameController::class, 'getGame']);

    // PUT /api/games/{game} -> GameController@updateGame
    Route::put('/', [GameController::class, 'updateGame']);

    // DELETE /api/games/{game} -> GameController@deleteGame
    Route::delete('/', [GameController::class, 'deleteGame']);

    // --- RUTAS DE MENSAJES ---

    // GET /api/games/{game}/messages -> GameController@getMessagesByGame
    Route::get('/messages/{id}', [GameController::class, 'getMessagesByGame']);

    // POST /api/games/{game}/messages -> GameController@addMessageByGame
    Route::post('/messages/{id}', [GameController::class, 'addMessageByGame']);

    // --- RUTAS DE JUGADORES ---
    // Necesitarás esta ruta para llenar la UI de WaitingRoom

    // GET /api/games/{game}/players
    // (Necesitarás crear este método 'getPlayersByGame' en tu GameController)
    // Route::get('/players', [GameController::class, 'getPlayersByGame']);-> para introducir los jugadores en la sala pero esto pertenece a otra HU
    //
}
);
