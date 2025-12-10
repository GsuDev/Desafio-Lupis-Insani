<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Votation extends Model
{
    protected $fillable = [
        'game_id',
        'is_day',
        'day_number',
        'is_closed',
    ];

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
