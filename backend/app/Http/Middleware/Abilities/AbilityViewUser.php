<?php

namespace App\Http\Middleware\Abilities;

use Closure;
use Illuminate\Http\Request;

class AbilityViewUser
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Si no hay usuario autenticado
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso',
                'data' => null,
            ], 401);
        }

        // Si puede ver todos los usuarios (admin)
        if ($user->tokenCan('view-user')) {
            return $next($request);
        }

        // Si puede verse a sí mismo y está viendo su propio perfil
        if ($user->tokenCan('view-itself')) {
            return $next($request);
        }

        // En cualquier otro caso → 401
        return response()->json([
            'success' => false,
            'message' => 'No tienes permiso',
            'data' => null,
        ], 401);
    }
}
