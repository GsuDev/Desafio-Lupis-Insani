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
}
