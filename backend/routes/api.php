<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameChannelController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WolvesChannelController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --------------
// Rutas públicas
// --------------

// Ruta temporal para probar la asignacion de bots
// Debug
Route::post('/games/{game}/bots', [GameController::class, 'testAssignBots']);

Route::post('/login', [AuthController::class, 'publicLogin']);
Route::post('/users', [UserController::class, 'store']);
Route::post('/register', [UserController::class, 'register']);
// Registro de usuario anónimo
Route::post('/register/anonymous', [AuthController::class, 'registerAnonymous']);
// Solicitar recuperación de contraseña
Route::post('/restore-password', [AuthController::class, 'restorePassword']);

// ------------------------------------------------------------------------

// ----------------------------
// Rutas protegidas de usuarios
// ----------------------------

// Ruta /logout protegida: Cerrar la sesion
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Ruta /reset-password: Nueva contraseña al recuperar
Route::middleware('auth:sanctum')->post('/reset-password', [AuthController::class, 'reset-password']);

// ------------------------------------------------------------------------

// ---------------------------
// Endpoints /users protegidos
// ---------------------------

Route::middleware('auth:sanctum')->group(function () {

    // ---------------------
    // Solo para rol 'admin'
    // ---------------------

    // Listado → solo tokens con ability 'list-users'
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('list-users');

    // Consultar uno → 'view-user'
    Route::get('/users/{id}', [UserController::class, 'show'])
        ->middleware('view-user');

    // Asignar roles → 'assign-roles'
    Route::post('/users/{id}/roles', [UserController::class, 'assignRoles'])
        ->middleware('assign-roles');

    // Actualizar → 'update-user'
    Route::put('/users/{id}', [UserController::class, 'update'])
        ->middleware('update-user');

    // Eliminar → 'delete-user'
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('delete-user');

    // Envio de mensajes por parte de admin

    Route::post('/notification/global', [NotificationController::class, 'send'])
        ->middleware('send-global-message');

    // --------------------------------
    // Solo para roles 'user' y 'admin'
    // --------------------------------

    // Estaisticas del usuario logueado
    Route::get('/users/statistics', [UserController::class, 'getStatistics']);
    
    // Consultar usuario actual
    Route::get('/user', [UserController::class, 'showItself'])
        ->middleware('view-user');

    // Actualizar al usuario actual → 'update-itself'
    Route::put('/users', [UserController::class, 'updateItself'])
        ->middleware('update-user');

    // Actualizar contraseña → 'update-itself'
    Route::put('/profile/password', [UserController::class, 'updatePassword'])
        ->middleware('update-user');

    // Eliminar al usuario actual → 'delete-itself'
    Route::delete('/users', [UserController::class, 'destroyItself'])
        ->middleware('delete-user');
});

// Ruta si el user no tiene la sesion iniciada
Route::get('/nologin', function () {
    return response()->json([
        'success' => false,
        'message' => 'No tienes permiso',
        'data' => null,
    ], 401);
});
/*
|--------------------------------------------------------------------------
| API Routes GAME
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

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
    Route::prefix('/games/{gameId}')->group(
        function () {

            // GET /api/games/{game} -> GameController@getGame
            Route::get('/', [GameController::class, 'getGameById']);

            // PUT /api/games/{game} -> GameController@updateGame
            Route::put('/', [GameController::class, 'updateGame']);

            // POST /api/games/{game}/join -> GameController@joinGame
            Route::post('/join', [GameController::class, 'joinGame'])->middleware('ability:join-game');

            // DELETE /api/games/{game} -> GameController@deleteGame
            Route::delete('/', [GameController::class, 'deleteGame']);

            // --- RUTAS DE MENSAJES ---

            // GET /api/games/{game}/messages -> GameController@getMessagesByGame
            Route::get('/messages', [GameController::class, 'getMessagesByGame']);

            // POST /api/games/{game}/messages -> GameController@addMessageByGame
            Route::post('/messages', [GameController::class, 'addMessageByGame']);

            // --- RUTAS DE JUGADORES ---
            // Necesitarás esta ruta para llenar la UI de WaitingRoom

            // GET /api/games/{game}/players
            // (Necesitarás crear este método 'getPlayersByGame' en tu GameController)
            Route::get('/participants', [GameController::class, 'getParticipantsByGame']); // -> para introducir los jugadores en la sala pero esto pertenece a otra HU
            //

            // --RUTAS DE ENVIO DE EVENTOS POR WEBSOCKETS---
            Route::post('/wolves/send', [WolvesChannelController::class, 'send'])->middleware('ability:send-events');
            Route::post('/game/send', [GameChannelController::class, 'send'])->middleware('ability:send-events');
        }
    );

});
