<?php

namespace App\Jobs;

use App\Models\Game;
use App\Models\Votation; 
use App\Http\Controllers\EventController;
use App\Http\Controllers\GameChannelController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class _06_TransitionToDayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $gameId;

    public function __construct(int $gameId)
    {
        $this->gameId = $gameId;
    }

    public function handle(): void
    {

        $game = Game::find($this->gameId);

        if (!$game) {
            //TODO
            return;
        }

        $duration = env('GAME_TRANSITION_TO_DAY_DURATION',10);
        // esto para calcular el dia y poder sumarle uno
        $lastDay = Votation::where('game_id', $this->gameId)->max('day_number') ?? 0;
        
        $currentDay = $lastDay + 1;

        
        $message = "Amanece en el pueblo... Un nuevo día comienza (Día {$currentDay})";
        
        
        EventController::systemMessage($message, 'system', $this->gameId);

        
        GameChannelController::systemSend(
            'game.day',
            [
                'phase' => 'day',
                'day_number' => $currentDay, 
                'game.conditions' => [
                    'finished' => false,
                    'winners' => null
                ]
            ],
            $this->gameId
        );

        // 4. ENCADENAR SIGUIENTE JOB
        // Pasamos el testigo para resolver qué pasó por la noche (muertes, etc.)
        //ResolveNightAttackJob::dispatch($this->gameId)
            //->delay(now()->addSeconds($duration)); // Pequeña pausa dramática

        
    }
}