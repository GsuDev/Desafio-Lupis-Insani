<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WolvesEvent implements ShouldBroadcast
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

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // direccion de envio a donde
        return [
            new PrivateChannel('wolves.'.$this->gameId),
        ];
    }

    // el que se entrega - contenido
    public function broadcastAs(): string
    {
        return $this->event;
    }
}
