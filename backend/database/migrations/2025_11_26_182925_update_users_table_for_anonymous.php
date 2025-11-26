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
        Schema::table('users', function (Blueprint $table) {
            /**
             * Si pones change, Laravel intentará crear una columna nueva llamada email
             * Como email ya existe mysql  dara un error  Duplicate column name 'email'
             *  Al poner change() le dices a laravel no crees nada nuevo
             * buscala columna que ya existe y modifica sus propiedades en este caso le quita la obligatoriedad
             */
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
            $table->string('lastname')->nullable()->change();
            $table->date('birthdate')->nullable()->change();
            $table->boolean('is_anonymous')->default(false)->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            // Esto fallará si hay datos nulos en la bbdd al hacer rollback.
            // Pero en desarrollo es el comportamiento correcto.
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
            $table->string('lastname')->nullable(false)->change();
            $table->date('birthdate')->nullable(false)->change();

            // Eliminamos la columna nueva
            $table->dropColumn('is_anonymous');
        });
    }
};
