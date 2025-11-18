<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Game extends Model
{
    /** @use HasFactory<\Database\Factories\GameFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'state',
        'url',
    ];

    protected $hidden = [
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    public function messages()
    {
        return $this->hasMany(Message::class, 'game_id', 'id');
    }

    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'participants',
            'game_id',
            'user_id');
    }

    // Sobre todo como admin o para debuggar, mostrar los mensajes en una partida
    public function getDetailedStatistics()
    {
        $this->loadCount('messages');

        $uniqueUsersCount = $this->messages()// cuenta los usuarios unicos registrados en la partida
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $messageTypes = $this->messages()
            ->groupBy('type')
            ->select('type', DB::raw('COUNT(*) as total'))
            ->get()
            ->pluck('total', 'type'); // Ej: ['INFO' => 50, 'CHAT' => 70]

        return [
            'total_messages' => $this->messages_count,
            'unique_users' => $uniqueUsersCount,
            'message_types' => $messageTypes,
        ];

    }

    public function addMessage(string $type, ?int $userID, string $message)
    {
        return Message::createMessage($type, $userID, $message, $this->id);
    }

    public function getStructuredMessages()
    {
        return $this->messages->map(function ($messages) {
            return $messages->toStructured();
        });
    }
}
