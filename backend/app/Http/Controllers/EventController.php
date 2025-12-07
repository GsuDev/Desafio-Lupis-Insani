<?php

namespace App\Http\Controllers;

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

            case 'game':
                return $data;
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

            case 'emited':
                $result = VoteController::vote($data, $gameId, $user);
                if (! $result['success']) {
                    // TODO: manejar error
                }

                return ['message' => $result['data']];
                break;

            case 'result':

                // Lógica en el job

                return $data;

                break;

            default:

                break;
        }
    }
}
