<?php

namespace App\Http\Middleware\Abilities;

use Closure;
use Illuminate\Http\Request;

class AbilityListUsers
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || ! $request->user()->tokenCan('list-users')) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        return $next($request);
    }
}
