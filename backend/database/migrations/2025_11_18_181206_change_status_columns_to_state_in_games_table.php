<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->enum('state', ['waiting', 'on_course', 'finished'])
                ->default('waiting')
                ->after('id');
        }); // Creo la nueva columna

        // Para que no haya conflictos
        DB::table('games')->where('ended', true)->update(['state' => 'finished']);
        DB::table('games')->where('ended', false)->where('started', true)->update(['state' => 'on_course']);

        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['started', 'ended']);
        }); // Elimino las anteriores
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Si se revierten las migraciones tengo que volver a restaurarlo
        Schema::table('games', function (Blueprint $table) {
            $table->boolean('started')->default(false);
            $table->boolean('ended')->default(false);
        });

        DB::table('games')->where('state', 'on_course')->update(['started' => true, 'ended' => false]);
        DB::table('games')->where('state', 'finished')->update(['started' => false, 'ended' => true]);

        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn('state');
        }); // Elimino la nueva columna
    }
};
