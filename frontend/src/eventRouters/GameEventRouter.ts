import { GameChannel } from '../channels/GameChannel'
import type { EventData } from '../interfaces/EventData'
import { ChatManager } from '../managers/ChatManager'

export class GameEventRouter {
    private channel: GameChannel

    constructor(gameId: number, channel: GameChannel) {
        this.channel = channel
    }

    // =============================
    // Router por categoría
    // =============================

    routeEvent(event: string, data: EventData): void {
        const category = event.split('.')[0]

        switch (category) {
            // Añadir categorias aquí
            case 'chat':
                ChatManager.handleEvent(event, data)
                break

            default:
                console.warn(`⚠️ Evento sin manager asignado: ${event}`, data)
        }
    }

    // =============================
    // Cierre del canal
    // =============================

    public disconnect(): void {
        this.channel.leave()
    }
}
