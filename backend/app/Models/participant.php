<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class participant extends Model
{
    /** @use HasFactory<\Database\Factories\ParticipantFactory> */
    use HasFactory;

    protected $fillable = [
        'game_id',
        'user_id',
        'is_bot',
        'is_host',
        'nickname',
        'character_id',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * Define la relación: Un participante pertenece a un juego (Game).
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    /**
     * Define la relación: Un participante (si no es bot) pertenece a un usuario (User).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define la relación: Un participante tiene un personaje (Character).
     */
    public function character()
    {
        return $this->belongsTo(Character::class);
    }

    /**relacion N:M con estaods  */
    public function states(){
        return $this->belongsToMany(State::class);
    }
}
