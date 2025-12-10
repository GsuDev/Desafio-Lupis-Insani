<?php

namespace App\Http\Middleware\Abilities;

use Closure;
use Illuminate\Http\Request;

class AbilitySendGlobalMessage
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || ! $request->user()->tokenCan('send-global-message')) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso',
                'data' => null,
            ], 401);
        }

        return $next($request);
    }
}
