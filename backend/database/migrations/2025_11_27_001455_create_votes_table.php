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
        Schema::create('votes',function (Blueprint $table){
            $table->id();

            $table->foreignId('game_id')
                ->constrained('games')
                ->onDelete('cascade');

            $table->foreignId('voter_id')
                ->constrained('participants')
                ->onDelete('cascade');

            $table->foreignId('target_id')
                ->constrained('participants')
                ->onDelete('cascade');
            
            //contexto temporal del juego
            $table->boolean('is_day'); 
            $table->integer('day_number');
        }); 
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
