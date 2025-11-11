<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Game extends Model
{
    /** @use HasFactory<\Database\Factories\GameFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ended',
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
            'stadistics',
            'game_id',
            'user_id');
    }

    // Sobre todo como admin o para debuggar, mostrar los mensajes en una partida
/*    public function getStatisticsChat()
    {
        $messages = $this->messages;
        return [
            'total_messages' => $messages->count(),
            'unique_users' => $messages->unique('user')->count(),//solo cuenta anonimo 1 vez tal y como lo tenemos planteado
            'message_type' => $messages->groupBy('type')->map->count(),
        ];
    }
*/
    //no se si es correcto hacerlo aquí
    public function addMessage(string $type, string $user, string $message)
    {
        $time = now()->format('Y/m/d|H:i:s');// se puede cambiar a un metodo que le guste al equipo
        return Message::createFormattedMessage($time, $type, $user, $message, $this->id);
    }
    public function getStructuredMessages()
    {
        return $this->messages->map(function ($messages) {
            return $messages->toStructured();
        });
    }
}
