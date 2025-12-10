<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    use HasFactory;

    protected $table = 'characters';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'is_unique',
        'description',
    ];

    protected $casts = [
        'is_unique' => 'boolean',
    ];

    public function participants()
    {
        return $this->hasMany(Participant::class);
    }
}
