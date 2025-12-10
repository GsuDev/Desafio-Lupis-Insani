<?php

namespace App\Http\Controllers;

use App\Models\participant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ParticipantController extends Controller
{
    /**
     * Obtiene todos los participantes de una partida.
     * Este es un método interno.
     */
    public function index($game_id)
    {
        try {

            $participants = participant::where('game_id', $game_id)
                ->with(['user', 'character', 'game'])
                ->get();

            return [
                'success' => true,
                'message' => 'Participantes obtenidos.',
                'data' => $participants,
            ];

        } catch (\Exception $e) {

            return [
                'success' => false,
                'message' => 'Error al consultar la base de datos: '.$e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Almacena un nuevo participante en una partida.
     * Este es un método interno.
     * Es llamado por otros controladores, no devuelve una Response.
     */
    public function store(int $game_id, ?int $user_id, bool $is_bot, bool $is_host, string $name)
    {

        $data = [
            'user_id' => $user_id,
            'is_bot' => $is_bot,
            'is_host' => $is_host,
            'game_id' => $game_id,
            'nickname' => $name,
            // 'character_id' => null, // Por defecto, se asignará en otra HU

        ];

        $validator = Validator::make($data, [
            'user_id' => [
                'nullable',
                'exists:users,id',
                Rule::unique('participants')->where('game_id', $game_id),
            ],
            'is_bot' => 'required|boolean',
            'is_host' => 'required|boolean',

        ]);

        if ($validator->fails()) {
            return [
                'success' => false,
                'message' => $validator->errors()->first(),
                'data' => null,
            ];
        }

        if ($data['is_bot']) {

            // Se podría cambiar mas adelante por fake o por otra forma
            $botNames = ['Alpha Wolf', 'Shadow Fox', 'Night Raven', 'Steel Fang', 'Lone Coyote', 'Lupi Insani'];
            $data['nickname'] = $botNames[array_rand($botNames)].' #'.Str::random(4);
            $data['user_id'] = null;
            // un bot debe tener 'nickname' pero no 'user_id'.
            // La regla se rompe si:
            //  (!empty($data['user_id'])) -> nos han pasado un user_id para un bot -> error
            //  (empty($data['nickname']))  -> no nos han pasado un nickname para un bot -> error
            if (! empty($data['user_id']) || empty($data['nickname'])) {

                return [
                    'success' => false,
                    'message' => ' user_id debe ser nulo y nickname obligatorio.',
                    'data' => null,
                ];
            }
        } else {
            // $data['nickname'] = null;
            // La regla se rompe si:
            //  (empty($data['user_id']))   -> no nos han pasado un user_id para un jugador-> error
            //  (!empty($data['nickname'])) -> nos han pasado un nickname para un jugador -> error ???????
            if (empty($data['user_id']) || empty($data['nickname'])) {
                return [
                    'success' => false,
                    'message' => 'user_id es obligatorio y nickname debe ser nulo.',
                    'data' => null,
                ];
            }
        }

        $participant = participant::create([
            'game_id' => $game_id,
            'user_id' => $data['user_id'],
            'is_bot' => $data['is_bot'],
            'is_host' => $data['is_host'],
            'nickname' => $data['nickname'],
            // 'character_id' => $data['character_id'],

        ]);

        // El método load() de Eloquent carga relaciones definidas en el modelo. En este caso, está
        // cargando las relaciones user, character y game del modelo Participant.
        // al usar load() aquí $participant ya inclute los datos relacionados
        // y facilita su uso en otros controladores o vistas
        // es la alternativa de with pero con load el objeto devuelto ya incluye los datos relacionados
        $participant->load(['user', 'character', 'game']);

        // No hay response()->json() se devuelve el objeto Modelo.
        return [
            'success' => true,
            'message' => 'Participante añadido.',
            'data' => $participant,
        ];
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
