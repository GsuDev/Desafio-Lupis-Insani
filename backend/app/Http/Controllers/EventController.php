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
                break;

            default:

                break;
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
                // TODO VICTOR: Aquí tu función de calcular resultado
                break;

            default:

                break;
        }
    }
}
