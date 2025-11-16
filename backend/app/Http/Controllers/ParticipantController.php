<?php

namespace App\Http\Controllers;

use App\Models\participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ParticipantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Almacena un nuevo participante en una partida.
     * Este es un método interno.
     * Es llamado por otros controladores, no devuelve una Response.
     */
    public function store(Request $request, $game_id)
    {

        $validator = Validator::make($request->all(), [
            'user_id' => [
                'nullable',
                'exists:users,id',
                // Validar que user_id no esté repetido en esta partida
                Rule::unique('game_participants')->where('game_id', $game_id),
            ],
            'is_bot' => 'required|boolean',
            'bot_name' => 'nullable|string|max:255',
            'character_id' => [
                'required',
                'exists:characters,id',
                // Validar que character_id no esté repetido en esta partida
                Rule::unique('participants')->where('game_id', $game_id),
            ],
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator); //forma de lanzar excepciones validator
        }


        $data = $validator->validated();

        if ($data['is_bot']) {

            // un bot debe tener 'bot_name' pero no 'user_id'.
            // La regla se rompe si:
            //  (!empty($data['user_id'])) -> nos han pasado un user_id para un bot -> error
            //  (empty($data['bot_name']))  -> no nos han pasado un bot_name para un bot -> error
            if (!empty($data['user_id']) || empty($data['bot_name'])) {
                // Lanzamos una excepción. Un bot no puede tener un ID de usuario,
                // y DEBE tener un nombre.
                // otro controlador pueda capturar
                throw new \Exception('Error de lógica de Bot: user_id debe ser nulo y bot_name obligatorio.');
            }
        } else {
            // La regla se rompe si:
            //  (empty($data['user_id']))   -> no nos han pasado un user_id para un jugador-> error
            //  (!empty($data['bot_name'])) -> nos han pasado un bot_name para un jugador -> error
            if (empty($data['user_id']) || !empty($data['bot_name'])) {
                // Lanzamos una excepción. Un jugador real debe tener un ID de usuario,
                // y no puede tener un nombre de bot.
                throw new \Exception('Error de lógica de Jugador: user_id es obligatorio y bot_name debe ser nulo.');
            }
        }


        $participant = participant::create([
            'game_id' => $game_id,
            'user_id' => $data['user_id'] ?? null,
            'is_bot' => $data['is_bot'],
            'bot_name' => $data['bot_name'] ?? null,
            'character_id' => $data['character_id'],
        ]);


        //El método load() de Eloquent carga relaciones definidas en el modelo. En este caso, está
        //cargando las relaciones user, character y game del modelo Participant.
        // al usar load() aquí $participant ya inclute los datos relacionados
        // y facilita su uso en otros controladores o vistas
        //es la alternativa de with pero con load el objeto devuelto ya incluye los datos relacionados
        $participant->load(['user', 'character', 'game']);

        // No hay response()->json() se devuelve el objeto Modelo.
        return $participant;
    }

    /**
     * Display the specified resource.
     */
    public function show(participant $participant)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, participant $participant)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(participant $participant)
    {
        //
    }
}
