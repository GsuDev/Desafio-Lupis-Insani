<?php

namespace App\Http\Controllers;

class EventController extends Controller
{
    public static function chatEventFilter($event, $data)
    {
        $category = explode('.', $event);
        switch ($category[1]) {

            case 'message':
                $result = GameController::addMessageByGame($data, 'user');
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
}
