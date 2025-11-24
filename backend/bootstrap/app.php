<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            // Middlewares de abilities
            'list-users' => \App\Http\Middleware\Abilities\AbilityListUsers::class,
            'view-user' => \App\Http\Middleware\Abilities\AbilityViewUser::class,
            'update-user' => \App\Http\Middleware\Abilities\AbilityUpdateUser::class,
            'delete-user' => \App\Http\Middleware\Abilities\AbilityDeleteUser::class,
            'assign-roles' => \App\Http\Middleware\Abilities\AbilityAssignRoles::class,
        ]);
        $middleware->redirectGuestsTo('/api/nologin');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
