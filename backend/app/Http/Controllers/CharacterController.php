<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\Game;
use Illuminate\Support\Facades\DB;

class CharacterController extends Controller
{
    /**
     * Asigna personajes a todos los participantes de una partida siguiendo estas reglas:
     *
     * 1. Se separan los participantes que son bots (is_bot = true) usando el accessor $game->bots.
     *    A los dos primeros bots se les asignan obligatoriamente los personajes con:
     *      - character_id = 1 (Aldeano)
     *      - character_id = 2 (Lobo)
     *
     * 2. Se asignan los personajes únicos (is_unique = true) primero a todos los humanos ($game->humans).
     *    Si sobran personajes únicos, se asignan a los bots restantes.
     *    La asignación de personajes únicos puede activarse o desactivarse mediante la variable de entorno USE_UNIQUE_CHARACTERS.
     *
     * 3. Se calcula el número de lobos necesarios según el total de participantes y el ratio definido en la variable de entorno WOLF_RATIO.
     *
     * 4. Se asignan los lobos restantes a participantes sin personaje (bots o humanos) hasta cumplir el número calculado.
     *
     * 5. Todos los participantes que aún no tienen personaje reciben un aldeano (character_id = 1) como personaje por defecto.
     *
     * El método utiliza los scopes/accessors de Game (humans y bots) para separar los tipos de participantes y
     * ejecuta todas las asignaciones dentro de una transacción para garantizar consistencia.
     *
     * Devuelve un array con:
     *    - success: true/false según el resultado
     *    - message: mensaje de éxito o de error específico de cada fase
     *    - data: colección de participantes con su character_id asignado en caso de éxito, o null si hay error
     */
    public function assignCharacters(Game $game)
    {
        try {
            DB::transaction(function () use ($game) {

                $humans = $game->participants->where('is_bot', false)->values();
                $bots = $game->participants->where('is_bot', true)->values();
                $total = $game->participants()->count();

                if ($total === 0) {
                    throw new \Exception('Error: No hay participantes en la partida.');
                }

                $used = collect(); // ids de participantes ya asignados

                // 1️⃣ Bots obligatorios
                $this->assignMandatoryBots($bots, $used);

                // 2️⃣ Personajes únicos
                $this->assignUniqueCharacters($humans, $bots, $used);

                // 3️⃣ Calcular lobos según ratio
                $wolvesNeeded = $this->calculateWolvesNeeded($game);

                // 4️⃣ Asignar lobos restantes
                $this->assignExtraWolves($game, $wolvesNeeded);

                // 5️⃣ Asignar aldeanos al resto
                $this->assignRemainingVillagers($game);
            });

            // Cargar participantes con character_id
            $participantsWithCharacters = $game->participants()->with('character')->get();

            return [
                'success' => true,
                'message' => 'Personajes asignados correctamente',
                'data' => $participantsWithCharacters,
            ];
        } catch (\Exception $e) {

            // Mensaje personalizado de cada excepción
            $message = $e->getMessage();

            return [
                'success' => false,
                'message' => $message,
                'data' => null,
            ];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1. Bots obligatorios (aldeano + lobo)
    |--------------------------------------------------------------------------
    */
    private function assignMandatoryBots($bots, &$used)
    {
        if ($bots->count() < 2) {
            throw new \Exception('Error: Se requieren al menos 2 bots para iniciar la partida.');
        }

        $bots = $bots->take(2)->values();

        $bots[0]->update(['character_id' => 1]); // Aldeano
        $bots[1]->update(['character_id' => 2]); // Lobo

        $used->push($bots[0]->id, $bots[1]->id);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. Personajes únicos
    |--------------------------------------------------------------------------
    */
    private function assignUniqueCharacters($humans, $bots, &$used)
    {
        if (! env('USE_UNIQUE_CHARACTERS', true)) {
            return;
        }

        $uniqueCharacters = Character::where('is_unique', true)->get();

        if ($uniqueCharacters->isEmpty()) {
            throw new \Exception('Error: No hay personajes únicos disponibles para asignar.');
        }

        // Humanos primero
        foreach ($humans as $human) {
            if ($uniqueCharacters->isEmpty()) {
                break;
            }
            if ($used->contains($human->id)) {
                continue;
            }

            $character = $uniqueCharacters->shift();
            $human->update(['character_id' => $character->id]);
            $used->push($human->id);
        }

        // Bots restantes
        foreach ($bots as $bot) {
            if ($uniqueCharacters->isEmpty()) {
                break;
            }
            if ($used->contains($bot->id)) {
                continue;
            }

            $character = $uniqueCharacters->shift();
            $bot->update(['character_id' => $character->id]);
            $used->push($bot->id);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 3. Cálculo de lobos según ratio
    |--------------------------------------------------------------------------
    */
    private function calculateWolvesNeeded(Game $game): int
    {
        $ratio = floatval(env('WOLF_RATIO', 0.25));
        $total = $game->participants()->count();

        if ($total === 0) {
            throw new \Exception('Error: No hay participantes en la partida.');
        }

        return max(1, round($total * $ratio));
    }

    /*
    |--------------------------------------------------------------------------
    | 4. Asignar lobos restantes
    |--------------------------------------------------------------------------
    */
    private function assignExtraWolves(Game $game, int $wolvesNeeded)
    {
        $currentWolves = $game->participants()->where('character_id', 2)->count();
        $remaining = max(0, $wolvesNeeded - $currentWolves);

        if ($remaining > 0) {
            $participants = $game->participants()
                ->whereNull('character_id')
                ->inRandomOrder()
                ->limit($remaining)
                ->get();

            if ($participants->isEmpty()) {
                throw new \Exception('Error: No hay participantes disponibles para asignar lobos restantes.');
            }

            foreach ($participants as $participant) {
                $participant->update(['character_id' => 2]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 5. Resto = Aldeanos
    |--------------------------------------------------------------------------
    */
    private function assignRemainingVillagers(Game $game)
    {
        $remaining = $game->participants()->whereNull('character_id')->count();

        if ($remaining === 0) {
            throw new \Exception('Error: No quedan participantes para asignar aldeanos.');
        }

        $game->participants()
            ->whereNull('character_id')
            ->update(['character_id' => 1]);
    }
}
