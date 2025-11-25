<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $event;

    public array $data;

    public int $gameId;

    public function __construct(string $event, array $data, int $gameId)
    {
        $this->event = $event;
        $this->data = $data;
        $this->gameId = $gameId;
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("game.{$this->gameId}");
    }

    public function broadcastAs(): string
    {
        return $this->event;
    }
}
