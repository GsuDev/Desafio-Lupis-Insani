<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GameController extends Controller
{
    // Crear Partida
    // se crea con cada sala
    public function createGame()
    {

        try {
            // Metodo 1 url con id
            // $game = new Game();
            // $game->ended = false;
            // $game->save();
            // $game->url = $game->id;
            // $game->save();

            // Metodo 2 url con uuid
            $uniqueUrl = (string) Str::uuid();
            $game = Game::create([
                'started' => false,
                'ended' => false,
                'url' => $uniqueUrl,
            ]);

            return response()->json($game, 201);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al crear partida', 'error' => $e->getMessage()], 500);
        }
    }
    // Get Partida

    public function getGameById($id)
    {
        // no aplico ningun validator porque el id se puede controllar desde el propio endpoint
        try {
            $game = Game::findOrFail($id);

            return response()->json($game, 200);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al obtener partida', 'error' => $e->getMessage()], 500);
        }
    }

    public function getGameByURL($url)
    {
        // no aplico ningun validator porque el id se puede controllar desde el propio endpoint
        try {
            $game = Game::where('url', $url)->firstOrFail();

            return response()->json($game, 200);
        } catch (ModelNotFoundException $e) {

            return response()->json(['mensaje' => 'Partida no encontrada'], 404);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al obtener partida', 'error' => $e->getMessage()], 500);
        }
    }

    // getPartidas
    public function getGames()
    {
        try {
            $games = Game::all();

            return response()->json($games, 200);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al obtener partidas', 'error' => $e->getMessage()], 500);
        }
    }

    // updatePartida
    public function updateGame(Request $req, $id)
    {
        $messages = [
            'started.required' => 'El campo "started" es requerido.',
            'started.boolean' => 'El campo "started" debe ser un valor booleano.',
            'ended.required' => 'El campo "ended" es requerido.',
            'ended.boolean' => 'El campo "ended" debe ser un valor booleano.',
        ];

        $rules = [
            'started' => 'required|boolean',
            'ended' => 'required|boolean',
        ];

        $validator = Validator::make($req->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json($validator->getErrors(), 422);
        }
        try {
            $game = Game::findOrFail($id);
            $game->ended = $req->input('ended');
            $game->save();

            return response()->json($game, 200);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al actualizar partida', 'error' => $e->getMessage()], 500);
        }
    }

    // deletePartida
    public function deleteGame($id)
    {// al usar soft delete, se sobre escribe el delete
        try {
            $game = Game::findOrFail($id);
            $game->delete();

            return response()->json(['mensaje' => 'Partida eliminada'], 200);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al eliminar partida', 'error' => $e->getMessage()], 500);
        }
    }

    // getMensajesByPartida
    public function getMessagesByGame($id)
    {
        try {
            $game = Game::findOrFail($id);

            return response()->json($game->getStructuredMessages(), 200);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al obtener mensajes', 'error' => $e->getMessage()], 500);
        }
    }

    // addMensajeByPartida
    public function addMessageByGame(Request $req, $id)
    {
        $messages = [
            'type.required' => 'El campo "type" es requerido.',
            'user_id.integer' => 'El campo "user_id" debe ser un ID de usuario válido.',
            'message.required' => 'El campo "message" es requerido.',
        ];

        $rules = [
            'type' => 'required|string',
            'user_id' => 'nullable|integer|exists:users,id',
            'message' => 'required|string',
        ];

        $validator = Validator::make($req->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json($validator->getErrors(), 422);
        }

        try {
            $game = Game::findOrFail($id);
            // ¡Pasa el user_id, no el user!
            $game->addMessage($req->type, $req->user_id, $req->message);

            return response()->json(['mensaje' => 'Mensaje añadido correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['mensaje' => 'Error al añadir mensaje', 'error' => $e->getMessage()], 500);
        }
    }
}
