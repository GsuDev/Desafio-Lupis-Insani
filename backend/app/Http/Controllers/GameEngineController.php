<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameEngineController extends Controller
{
    /**
     * Asigna roles aleatorios a los participantes de la partida
     */
    public function assignCharacters($gameId)
    {
        try {
            $game = Game::with('participants')->findOrFail($gameId);
            $participants = $game->participants;
            $totalPlayers = $participants->count();

            if ($totalPlayers < 4) {
                return response()->json(['success' => false, 'message' => 'No hay suficientes jugadores para asignar roles (mínimo 4)'], 400);
            }

            // 1. Obtener todos los personajes disponibles de la BBDD
            // Usamos el nombre como clave para fácil acceso: $chars['Lobo']->id
            $characters = Character::all()->keyBy('name');

            // 2. Configuración de Balance (Reglas del juego)
            // Calcula número de lobos (aprox 1/4 o 1/5 del total)
            $wolvesCount = max(1, floor($totalPlayers / 4));

            // Lista de roles especiales que SIEMPRE queremos en partidas grandes
            // Ajusta esta lista según tus preferencias
            $specialRoles = ['Vidente', 'Bruja', 'Cazador', 'Cupido', 'Niña', 'Ladrón'];

            // 3. Construir el Mazo de Cartas
            $deck = [];

            // A) Añadir Lobos
            if (isset($characters['Lobo'])) {
                for ($i = 0; $i < $wolvesCount; $i++) {
                    $deck[] = $characters['Lobo']->id;
                }
            }

            // B) Añadir Roles Especiales Únicos
            foreach ($specialRoles as $roleName) {
                if (isset($characters[$roleName])) {
                    // Solo añadimos si hay espacio suficiente en el mazo antes de llenarlo de aldeanos
                    if (count($deck) < $totalPlayers - 1) { // Dejamos al menos 1 hueco para aldeano
                        $deck[] = $characters[$roleName]->id;
                    }
                }
            }

            // C) Rellenar el resto con Aldeanos
            if (isset($characters['Aldeano'])) {
                while (count($deck) < $totalPlayers) {
                    $deck[] = $characters['Aldeano']->id;
                }
            }

            // 4. Barajar el mazo
            shuffle($deck);
            //TODO: obligar a que haya un bot aldeano y un bot lobo
            // 5. Asignar cartas a los participantes
            // Usamos una transacción para asegurar que o se asignan todos o ninguno
            DB::transaction(function () use ($participants, $deck) {
                foreach ($participants as $index => $participant) {
                    // Asignamos el ID del personaje que toca en esa posición del mazo
                    $participant->character_id = $deck[$index];
                    $participant->save();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Personajes asignados correctamente',
                'data' => [
                    'wolves_count' => $wolvesCount,
                    'total_assigned' => count($deck)
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Error al asignar personajes: {$e->getMessage()}",
                'data' => null
            ], 500);
        }
    }
}
