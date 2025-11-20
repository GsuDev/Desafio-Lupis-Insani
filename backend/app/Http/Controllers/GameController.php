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
            // $game->state = 'waiting';
            // $game->save();
            // $game->url = $game->id;
            // $game->save();

            // Metodo 2 url con uuid
            $uniqueUrl = (string) Str::uuid();
            $game = Game::create([
                'state' => 'waiting',
                'url' => $uniqueUrl,
            ]);

            return response()->json(['success' => true, 'message' => 'Partida creada', 'data' => $game], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al crear partida, {$e->getMessage()}", 'data' => ''], 500);
        }
    }
    // Get Partida

    public function getGameById($gameId)
    {
        // no aplico ningun validator porque el id se puede controllar desde el propio endpoint
        try {
            $game = Game::findOrFail($gameId);
            return response()->json(['success' => true, 'message' => 'Partida obtenida', 'data' => $game], 200);

        } catch (ModelNotFoundException $e) {

            return response()->json(['seccess' => false, 'message' => 'Partida no encontrada', 'data' => ''], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al obtener partida, {$e->getMessage()}", 'data' => ''], 500);
        }
    }

    public function getGameByURL($url)
    {
        // no aplico ningun validator porque el id se puede controllar desde el propio endpoint
        try {
            $game = Game::where('url', $url)->firstOrFail();

            return response()->json($game, 200);
        } catch (ModelNotFoundException $e) {

            return response()->json(['seccess' => false, 'message' => 'Partida no encontrada', 'data' => ''], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al obtener partida {$e->getMessage()}", 'data' => ''], 500);
        }
    }

    // getPartidas
    public function getGames()
    {
        try {
            $games = Game::all();

            return response()->json(['success' => true, 'message' => 'Partidas obtenidas', 'data' => $games], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al obtener partidas, {$e->getMessage()}", 'data' => ''], 500);
        }

    }

    // updatePartida
    public function updateGame(Request $req, $gameId)
    {
        $messages = [
            'state.required' => 'El campo "state" es requerido.',
            'state.in' => 'El campo "state" debe ser valido, opciones: waiting, on_course, finished',
        ];

        $rules = [
            'state' => 'required|string|in:waiting,on_course,finished',
        ];

        $validator = Validator::make($req->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json($validator->getErrors(), 422);
        }
        try {
            $game = Game::findOrFail($gameId);
            $game->state = $req->input('state');
            $game->save();

            return response()->json(['success' => true, 'message' => 'Partida actualizada', 'data' => $game], 200);
        } catch (\Exception $e) {
            // Success| message | data
            return response()->json(['success' => false, 'message' => "Error al actualizar partida, {$e->getMessage()}", 'data' => ''], 500);
        }
    }

    // deletePartida
    public function deleteGame($gameId)
    {// al usar soft delete, se sobre escribe el delete
        try {
            $game = Game::findOrFail($gameId);
            $game->delete();

            return response()->json(['success' => true, 'message' => 'Partida eliminada', 'data' => ''], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al eliminar partida, {$e->getMessage()}", 'data' => ''], 500);
        }
    }

    // getMensajesByPartida
    public function getMessagesByGame($gameId)
    {
        try {
            $game = Game::findOrFail($gameId);

            return response()->json(['success' => true, 'message' => 'Mensajes obtenidos', 'data' => $game->getStructuredMessages()], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al obtener mensajes, {$e->getMessage()}", 'data' => ''], 500);
        }
    }

    // addMensajeByPartida
    public function addMessageByGame(Request $req, $gameId)
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
            $game = Game::findOrFail($gameId);
            // ¡Pasa el user_id, no el user!
            $game->addMessage($req->type, $req->user_id, $req->message);

            return response()->json(['success' => true, 'message' => 'Mensaje añadido correctamente', 'data' => ''], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al añadir mensaje,{$e->getMessage()}", 'data' => ''], 500);
        }
    }

    public function joinGame(Request $req, $gameId)
    {
        try {
            $game = Game::findOrFail($gameId);
            $user = $req->user();

            if ($game->state != 'waiting') {
                return response()->json(['success' => false, 'message' => 'No se puede unir a la partida, no está en estado waiting', 'data' => ''], 403);
            }
            $currentCount = $game->participants->count();
            if ($currentCount > 28)//variable global
            {
                return response()->json(['success' => false, 'message' => 'No se puede unir a la partida, esta completa o el usuario ya está en la partida', 'data' => ''], 403);
            }
            if ($game->users()->where('user_id', $user->id)->exists()) {

                $game->load('users');
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede unir a la partida, el usuario ya está en la partida',
                    'data' => $game
                ], 200);
            }


            //Llamo a ParticipantController Para asignar el usuario
            $participantController = app(ParticipantController::class);
            $result = $participantController->store(
                $gameId,
                $user->id,
                false,
                $currentCount == 0
            ); 

            // $game->users()->attach($user->id);
            //controlo que haya salido bien
            if (!$result['success']) {
                return response()->json(["success" => false, "message" => $result['message'], "data" => $result['data']], 422);
            }
            //recargo los datos de partida
            $game->load('users');

            //trigger evento de nuevo usuario dentro lo dejo comentado mas o menos para tener una orientacion
            //event(new UserJoinedGame($game, $user))

            return response()->json([
                'success' => true,
                'message' => 'Usuario añadido correctamente',
                'data' => $game
            ], 200);

        } catch (ModelNotFoundException $e) {

            return response()->json(['success' => false, 'message' => 'Partida no encontrada', 'data' => ''], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => "Error al añadir usuario a la partida,{$e->getMessage()}", 'data' => ''], 500);
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

            if (!$game) {
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
                $botName = 'Bot_' . Str::random(8);

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
