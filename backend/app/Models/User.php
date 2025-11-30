<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'nickname',
        'lastname',
        'email',
        'password',
        'birthdate',
        'profile_url',
        'is_anonymous',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birthdate' => 'date',
        'is_anonymous' => 'boolean',
    ];

    /**
     * Relación muchos a muchos con Role
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * Función helper para comprobar si el usuario tiene un rol
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->pluck('name')->contains($roleName);
    }

    /**helper para saber si el usuario es anonimo */
    public function isAnonymous(): bool
    {
        return $this->is_anonymous;
    }

    /**
     * si un jugador juega 5 partidas por ejemplo
     * tiene que tener 5 registros en la tabla participants
     * de ahi esta relacion
     */
    public function participants()
    {
        return $this->hasMany(participant::class);
    }
}
