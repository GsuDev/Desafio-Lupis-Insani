<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    /** @use HasFactory<\Database\Factories\MessageFactory> */
    use HasFactory;


    protected $fillable = [
        'content',
        'game_id',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $appends = ['time', 'type', 'user', 'message'];


    public function game()
    {
        return $this->belongsTo(Game::class, 'game_id');
    }


    public function getTimeAttribute()
    {
        return $this->parseContent()['time'] ?? '';
    }

    public function getTypeAttribute()
    {
        return $this->parseContent()['type'] ?? '';
    }

    public function getUserAttribute()
    {
        return $this->parseContent()['user'] ?? '';
    }

    public function getMessageAttribute()
    {
        return $this->parseContent()['message'] ?? '';
    }
    private function parseContent()
    {
        if (empty($this->content)) {
            return [];
        }

        $parts = explode('-', $this->content, 4);

        return [
            'time' => $parts[0] ?? '',
            'type' => $parts[1] ?? '',
            'user' => $parts[2] ?? '',
            'message' => $parts[3] ?? $this->content,
        ];


    }

    //Crea un mensaje formateado
    public static function createFormattedMessage(
        string $time,
        string $type,
        string $user,
        string $message,
        int $gameId
    ) {
        return self::create([
            'content' => "{$time}-{$type}-{$user}-{$message}",
            'game_id' => $gameId
        ]);
    }


    public function toStructured()
    {
        return [
            'time' => $this->time,
            'type' => $this->type,
            'user' => $this->user,
            'message' => $this->message,
            'timestamp' => $this->created_at
        ];
    }
}
