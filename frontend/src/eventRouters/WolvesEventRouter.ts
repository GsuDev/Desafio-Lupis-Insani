import { WolvesChannel } from '../channels/WolvesChannel'
import type { EventData } from '../interfaces/EventData'
import { ChatManager } from '../managers/ChatManager'

export class WolvesEventRouter {
    private channel: WolvesChannel

    constructor(gameId: number, channel: WolvesChannel) {
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
