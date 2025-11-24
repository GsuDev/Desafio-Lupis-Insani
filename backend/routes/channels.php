<?php

use App\Models\Participant;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
 * canal privado para los Lobos
 * solopermite la entrada si el usuario es participante de la partida
 * y si su personaje asignado es el ID 2 (Lobo)
 */
Broadcast::channel('wolves.{gameId}', function (User $user, int $gameId) {

    // detectamos el participante de si esta en la partida
    $participant = Participant::where('user_id', $user->id)
        ->where('game_id', $gameId)
        ->first();

    // Si no está en la partida, prohibido pasar false
    if (! $participant) {
        return false;
    }

    // se verifica   Rol
    //  CharacterController: ID 2 = Lobo
    // También aceptamos al personaje de la niña se implementara en el futuro

    return $participant->character_id === 2;
});
