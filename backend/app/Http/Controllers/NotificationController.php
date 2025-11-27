<?php

namespace App\Http\Controllers;

use App\Events\GlobalEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NotificationController extends Controller
{
    /**
     * Enviar notificación global a todos los usuarios
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event' => 'required|string|regex:/^[a-z]+\.[a-z_]+$/',
            'data.message' => 'required|string|max:500',
            'data.type' => 'sometimes|in:info,warning,critical,maintenance,announcement',
            'data.server_status' => 'sometimes|in:online,offline,maintenance',
            'data.estimated_duration' => 'sometimes|integer|min:1|max:1440',
            'data.metadata' => 'sometimes|array',
        ]);

        // Creo una instancia del evento para poder acceder a sus datos.
        $event = new GlobalEvent(
            $validated['event'],
            $validated['data']
        );

        GlobalEvent::dispatch($event);

        \Log::info('Global notification sent', [
            'event_id' => $event->data['event_id'],
            'admin_id' => auth()->id(),
            'event' => $validated['event'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notificación global enviada.',
            'data' => $event->data,
        ], 200);
    }
}
