<?php

namespace App\Http\Controllers;

use App\Models\Vote;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    //Este metodo se completara en otra hu
    public function registerVote(Request $request){
        $validated = $request->validate([
            'game_id' => 'required|integer|exists:game,id',
            'voter_id' => 'required|integer|exists:participants,id',
            'target_id' => 'required|integer|exists:participants,id',
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer|min:1'
        ]);

        $vote = Vote::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Voto registrado correctamente',
            'data' => [
                'vote' => $vote
            ],
        ],201);
    }

    /**
     * 
     * Obtiene los votos filtrados por partida, fase y ciclo.
     */

    public function getVotes(Request $request, $gameId){
        $request->validate([
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer',
        ]);

        $votes = Vote::where('game_id',$gameId)
            ->where('is_day', $request->boolean('is_day'))
            ->where('day_number', $request->input('day_number'))
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Votos recuperados con exito',
            'data' => [
                'votes' => $votes
            ]
        ],200);
    }
}
