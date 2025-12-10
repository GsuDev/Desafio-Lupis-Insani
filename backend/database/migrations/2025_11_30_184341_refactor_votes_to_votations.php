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
        Schema::create('votations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->boolean('is_day');
            $table->integer('day_number');
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            // esto es un indice para busquedas más rapidas
            $table->index(['game_id', 'is_day', 'day_number']);
        });

        // despues de crear votations preparo la tabla votes para la nueva relacion
        Schema::table('votes', function (Blueprint $table) {
            // paso necesario para que no "reviente" ya que no tiene aun los valores creados
            $table->unsignedBigInteger('votation_id')->nullable()->after('id');
        });

        // migracion de datos
        $existingGroups = DB::table('votes')
            ->select('game_id', 'is_day', 'day_number')
            ->distinct()
            ->get();
        foreach ($existingGroups as $group) {
            $votationId = DB::table('votations')->insertGetId([
                'game_id' => $group->game_id,
                'is_day' => $group->is_day,
                'day_number' => $group->day_number,
                'is_closed' => true, // Asumimo que todas estan cerradas por defecto
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('votes')
                ->where('game_id', $group->game_id)
                ->where('is_day', $group->is_day)
                ->where('day_number', $group->day_number)
                ->update(['votation_id' => $votationId]);
        }

        Schema::table('votes', function (Blueprint $table) {

            $table->unsignedBigInteger('votation_id')->nullable(false)->change();

            $table->foreign('votation_id')->references('id')->on('votations')->onDelete('cascade');

            // Elimino las columnas antiguas redundantes
            $table->dropForeign(['game_id']);
            $table->dropColumn(['game_id', 'is_day', 'day_number']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // logica inversa
        Schema::table('votes', function (Blueprint $table) {
            $table->foreignId('game_id')->nullable()->constrained()->onDelete('cascade');
            $table->boolean('is_day')->nullable();
            $table->integer('day_number')->nullable();
        });

        $votations = DB::table('votations')->get();
        foreach ($votations as $votation) {
            DB::table('votes')
                ->where('votation_id', $votation->id)
                ->update([
                    'game_id' => $votation->game_id,
                    'is_day' => $votation->is_day,
                    'day_number' => $votation->day_number,
                ]);
        }

        Schema::table('votes', function (Blueprint $table) {
            $table->unsignedBigInteger('game_id')->nullable(false)->change();
            $table->boolean('is_day')->nullable(false)->change();
            $table->integer('day_number')->nullable(false)->change();

            $table->dropForeign(['votation_id']);
            $table->dropColumn('votation_id');
        });

        Schema::dropIfExists('votations');
    }
};
