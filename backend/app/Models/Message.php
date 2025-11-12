<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    /** @use HasFactory<\Database\Factories\MessageFactory> */
    use HasFactory;


    protected $fillable = [
        'type',
        'user_id',
        'message',
        'game_id',
        'created_at',
    ];
    protected $hidden = [
        'updated_at',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class, 'game_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id')->withDefault([
            'name'=> 'Anónimo',
        ]);// con esto controlo que sea un usuario anonimo

    }


    //Crea un mensaje formateado
    public static function createMessage(
        string $type,
        ?int $userID, // como es nullable
        string $message,
        int $gameId
    ) {
        return self::create([
            'type' => $type,
            'user_id' => $userID,
            'message' => $message,
            'game_id' => $gameId
        ]);
    }


    public function toStructured()
    {
        return [
            'time' => $this->created_at,
            'type' => $this->type,
            'user' => $this->user->name,
            'message' => $this->message,
        ];
    }
}
