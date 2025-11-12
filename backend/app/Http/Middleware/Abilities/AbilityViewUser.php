<?php

namespace App\Http\Middleware\Abilities;

use Closure;
use Illuminate\Http\Request;

class AbilityViewUser
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $id = (int) $request->route('id'); // casteamos a int
        $isItself = $user && $user->id == $id;

        // Si no hay usuario autenticado
        if (! $user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Si puede ver todos los usuarios (admin)
        if ($user->tokenCan('view-user')) {
            return $next($request);
        }

        // Si puede verse a sí mismo y está viendo su propio perfil
        if ($user->tokenCan('view-itself') && $isItself) {
            return $next($request);
        }

        // En cualquier otro caso → 403
        return response()->json(['message' => 'No tienes permiso'], 403);
    }
}
