<?php

use App\Models\participant;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Aquí se ajusta quien puede suscribirse a los canales

/*
 * Canales privados para los Lobos
 * solopermite la entrada si el usuario es participante de la partida
 * y si su personaje asignado es el ID 2 (Lobo)
 */
Broadcast::channel('wolves.{gameId}', function (User $user, int $gameId) {

    // detectamos el participante de si esta en la partida
    $participant = participant::where('user_id', $user->id)
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

/*
 * Canales privados para las partidas
 * Solo permite la entrada si el usuario es participante de la partida
 */
Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    // detectamos el participante de si esta en la partida
    $participant = participant::where('user_id', $user->id)
        ->where('game_id', $gameId)
        ->first();

    // Si no está en la partida, prohibido
    if (! $participant) {
        return false;
    }

    return true;
});
