<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\participant;
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

    /**
     * Método interno para rellenar la partida de bots
     * HU9: Garantiza mínimo de 15 jugadores y siempre +2bots
     * Hasta nu máximo de 30 participantes totales
     */
    public function assignBots($gameId)
    {
        try {

            // Recuperamos la partida con sus participantes (humanos y bots)
            $game = Game::with('participants')->find($gameId);

            if (! $game) {
                return [
                    'success' => false,
                    'message' => 'Partida no encontrada',
                    'data' => null,
                ];
            }

            $currentCount = $game->participants->count();
            $minGamePlayers = 15;
            $maxGamePlayers = 30;
            $mandatoryBots = 2;

            // Se calcula el hueco que falta para llegar al mínimo de 15
            $gapToMin = $minGamePlayers - $currentCount;
            $botsNeeded = max($gapToMin, $mandatoryBots);

            // No puede haber más de 30 participantes en la partida
            if ($currentCount + $botsNeeded > $maxGamePlayers) {
                return [
                    'success' => false,
                    'message' => "Error de integridad: Hay $currentCount jugadores.",
                    'data' => ['current' => $currentCount, 'needed' => $botsNeeded],

                ];
            }

            // bots data seria el registro que iria en participants
            $botsData = [];
            $timestamp = now();

            for ($i = 0; $i < $botsNeeded; $i++) {
                $botName = 'Bot_'.Str::random(8);

                $botsData[] = [
                    'game_id' => $gameId,
                    'user_id' => null,
                    'is_bot' => true,
                    'bot_name' => $botName,
                    'character_id' => null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }

            // Se insertan todos los bots de golpe
            participant::insert($botsData);
            // Usamos 'load' para forzar una nueva consulta y traer los datos actualizados
            $game->load('participants');

            return [
                'success' => true,
                'message' => "Asignación completa de bots, se han asignado $botsNeeded bots ",
                // la respuesta de la data está sujeta a cambios, porque no sabía exactamente que devolver concretamente
                'data' => [
                    'added' => $botsNeeded,
                    'total_participants' => $game->participants->count(),
                ],
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Fallo inesperado',
                'data' => null,
            ];
        }
    }

    // Es un "puente" temporal para poder probar la lógica interna desde los tests.
    public function testAssignBots($id)
    {

        $result = $this->assignBots($id);

        if ($result['success']) {
            return response()->json($result, 200);
        } else {
            // Si falla, devolvemos un error 500 para que el test lo detecte
            return response()->json($result, 500);
        }
    }
}
