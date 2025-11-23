<?php

namespace App\Http\Controllers;

use App\Events\WolvesEvent; 
use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WolvesChannelController extends Controller
{
    public function send(Request $request, int $gameId){
        $validator = Validator::make($request->all(), [
            'event' => 'required|string',
            'data' => 'required|nullable|array', // se permite null o array 
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()],400);
        }

        $user = $request->user();

        
        
        // se verifica que quien envía el post es realmente un lobo en esta partida

        $participant = Participant::where('user_id', $user->id)
                                ->where('game_id', $gameId)
                                ->first();

        // Si no es participante o no es lobo (ID 2), bloqueamos el envío.
        //cuando se implante la niña esto sepodrá cambiar si fuese necesario
        if (!$participant || $participant->character_id !== 2 ) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para hablar en este canal.'
            ], 403);
        }

        // se emite el evento al canal privado
        // Usamos toOthers() para que no se le reenvie el mensaje al que lo escribó
        broadcast(new WolvesEvent(
            $validator->validated()['event'],
            $validator->validated()['data'] ?? [] , // si es null se envia array vacio
            $gameId
        ))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Evento enviado a los lobos correctamente.',
            'data' => null,
        ]);
        

    }
}
