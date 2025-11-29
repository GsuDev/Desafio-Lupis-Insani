<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GlobalEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $event;

    public array $data;

    public function __construct(string $event, array $data)
    {
        $this->event = $event;
        $this->data = array_merge($data, [
            'timestamp' => now(),
            'event_id' => \Illuminate\Support\Str::uuid(), // no me parece mala idea
        ]);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('global');
    }

    public function broadcastAs(): string
    {
        return $this->event;
    }
}
