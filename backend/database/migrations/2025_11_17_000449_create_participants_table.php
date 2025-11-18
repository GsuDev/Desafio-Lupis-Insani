<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('game_id')
                  ->constrained('games')
                  ->onDelete('cascade');
                  
            $table->foreignId('user_id')
                  ->nullable() // Para los bots
                  ->constrained('users')
                  ->onDelete('cascade');
            
            $table->boolean('is_bot')->default(false);
            $table->string('bot_name')->nullable();
            
            $table->foreignId('character_id')
                  ->nullable()
                  ->constrained('characters')
                  ->onDelete('cascade');

            $table->timestamps();
            
            
            //  estas validaciones van en el controlador pero las pongo aquí como doble seguro
            
            // Un usuario no puede estar dos veces en la misma partida
            //$table->unique(['game_id', 'user_id']);
            
            // Un personaje no puede estar dos veces en la misma partida
           // $table->unique(['game_id', 'character_id']);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
