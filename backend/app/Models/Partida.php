<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Partida extends Model
{
    /** @use HasFactory<\Database\Factories\PartidaFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'finalizada',
        'url',
    ];
    protected $hidden = [
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    public function mensajes()
    {
        return $this->hasMany(Mensaje::class, 'partida_id', 'id');
    }
}
