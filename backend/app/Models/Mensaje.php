<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    /** @use HasFactory<\Database\Factories\MensajeFactory> */
    use HasFactory;
    protected $fillable = [
        'cotenido',
        'partida_id',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];


    public function partida()
    {
        return $this->belongsTo(Partida::class, 'partida_id');
    }
}
