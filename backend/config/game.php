<?php

return [
    'timers' => [
        // tiempo que tienen los jugadores para votar al alcalde en segundos
        'mayor_vote_duration' => env('GAME_MAYOR_VOTE_DURATION', 10),
        'night_transition_duration' => env('GAME_NIGHT_TRANSITION_DURATION', 5),
        'wolves_discussion_duration' => env('GAME_WOLVES_DISCUSSION_DURATION', 10),
        'mayor_discussion_duration' => env('GAME_MAYOR_DISCUSSION_DURATION', 10),
    ],
];
