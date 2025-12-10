<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    // Campos que se pueden asignar en masa
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Relación muchos a muchos con User
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
