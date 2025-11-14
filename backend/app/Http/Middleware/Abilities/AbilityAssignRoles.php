<?php

namespace App\Http\Middleware\Abilities;

use Closure;
use Illuminate\Http\Request;

class AbilityAssignRoles
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || ! $request->user()->tokenCan('assign-roles')) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        return $next($request);
    }
}
