<?php

namespace App\Http\Middleware\Abilities;

use Closure;
use Illuminate\Http\Request;

class AbilityAssignRoles
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || ! $request->user()->tokenCan('assign-roles')) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso',
                'data' => null,
            ], 401);
        }

        return $next($request);
    }
}
