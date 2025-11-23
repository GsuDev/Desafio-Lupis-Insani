<?php

namespace App\Events;

use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class GameEvent implements ShouldBroadcast
{
    public function __construct(
        public string $event,
        public array $data,
        public int $gameId
    ) {}

    public function broadcastOn()
    {
        return new PresenceChannel("game.{$this->gameId}");
    }

    public function broadcastAs()
    {
        return $this->event; // ej: "game.start", "player.dead"
    }
}
