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


}
