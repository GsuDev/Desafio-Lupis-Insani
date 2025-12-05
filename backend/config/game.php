<?php

return [
    'timers' => [
        // tiempo que tienen los jugadores para votar al alcalde en segundos
        'mayor_vote_duration' => env('GAME_MAYOR_VOTE_DURATION', 30),
        'night_transition_duration' => env('GAME_NIGHT_TRANSITION_DURATION', 5),
    ],
];
