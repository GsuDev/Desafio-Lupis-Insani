<?php

use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- RUTAS DE GAME ---

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
    Route::get('/messages', [GameController::class, 'getMessagesByGame']);

    // POST /api/games/{game}/messages -> GameController@addMessageByGame
    Route::post('/messages', [GameController::class, 'addMessageByGame']);

    // --- RUTAS DE JUGADORES ---
    // Necesitarás esta ruta para llenar la UI de WaitingRoom

    // GET /api/games/{game}/players
    // (Necesitarás crear este método 'getPlayersByGame' en tu GameController)
    // Route::get('/players', [GameController::class, 'getPlayersByGame']);-> para introducir los jugadores en la sala pero esto pertenece a otra HU
    //
}
);
