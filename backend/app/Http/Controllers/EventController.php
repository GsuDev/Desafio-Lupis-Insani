<?php

namespace App\Http\Controllers;

use App\Models\participant;
use App\Models\State;

class EventController extends Controller
{
    // Filtro por categoría
    public static function eventCategoryFilter($event, $data, $gameId, $user)
    {
        $category = explode('.', $event);
        switch ($category[0]) {

            case 'chat':
                return EventController::chatEventFilter($event, $data, $gameId, $user);
                break;

            case 'vote':
                return EventController::voteEventFilter($event, $data, $gameId, $user);
                break;

            case 'player':
                return EventController::playerEventFilter($event, $data, $gameId, $user);
                break;

            case 'game':
                return EventController::gameEventFilter($event, $data, $gameId, $user);
                break;

            default:

                break;
        }
    }

    public static function chatEventFilter($event, $data, $gameId, $user)
    {
        $category = explode('.', $event);
        switch ($category[1]) {

            case 'message':
                $result = GameController::addMessageByGame($data, 'user', $gameId, $user);
                if (! $result['success']) {
                    // TODO: manejar error
                }

                return ['message' => $result['data']];
                break;

            case 'system':
                // Mensajes del sistema
                $result = GameController::addMessageByGame($data, 'system', $gameId, $user);
                if (! $result['success']) {
                    // TODO: manejar error
                }

                return ['message' => $result['data']];
                break;

            default:

                break;
        }
    }

    // Metodo atajo para mandar mensajes del sistema
    public static function systemMessage(string $msg, $channel, $gameId)
    {
        if ($channel === 'wolves') {
            $data = [
                'message' => $msg,
            ];
            WolvesChannelController::systemSend('chat.system', $data, $gameId);
        } else {
            $data = [
                'message' => $msg,
            ];
            GameChannelController::systemSend('chat.system', $data, $gameId);
        }
    }

    public static function voteEventFilter($event, $data, $gameId, $user)
    {
        $category = explode('.', $event);
        switch ($category[1]) {
            case 'emitted':
                $result = VoteController::vote($data, $gameId, $user);

                // 🔥 Si falla, devolver null para que no se emita el evento
                if (! $result['success']) {
                    return ['dontEmit'];
                }

                // Obtener voterId del participante actual
                $participant = Participant::where('user_id', $user->id)
                    ->where('game_id', $gameId)
                    ->first();

                if (! $participant) {
                    return ['dontEmit'];
                }

                return [
                    'vote' => $result['data']['vote'],
                    'isAnUnvote' => $result['data']['isAnUnvote'],
                    'voterId' => $participant->id,
                    'targetId' => $data['targetId'],
                ];
                break;
            case 'result':
                return $data;
                break;
            default:
                break;
        }
    }

    public static function playerEventFilter($event, $data, $gameId, $user)
    {
        $category = explode('.', $event);

        switch ($category[1]) {
            case 'left':

                $participant = participant::where('game_id', $gameId)
                    ->where('user_id', $user->id)
                    ->first();

                if ($participant) {

                    $deadState = State::firstOrCreate(['name' => 'DEAD']);

                    // Usamos syncWithoutDetaching para no borrar otros estados (ej: si era Vidente)
                    $participant->states()->syncWithoutDetaching([$deadState->id]);
                }

                return $data;
                break;

            default:
                return $data;
                break;
        }
    }

    public static function gameEventFilter($event, $data, $gameId, $user)
    {
        $category = explode('.', $event);
        switch ($category[1]) {

            case 'discussion':
                return $data;
                break;

            case 'conditions':
                // Lógica en el job
                return $data;

                break;
            case 'narrator':
                return $data;
                break;

            default:

                break;
        }
    }
}
