<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'game_id',
        'voter_id',
        'target_id',
        'is_day',
        'day_number',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * El participante que vota.
     * Especificamos 'voter_id' porque Laravel buscaría 'participant_id' por defecto
     */
    public function voter()
    {
        return $this->belongsTo(participant::class, 'voter_id');
    }

    /**
     * El participante al que votan
     * Especificamos 'target_id'
     */
    public function target()
    {
        return $this->belongsTo(participant::class, 'target_id');
    }
}
