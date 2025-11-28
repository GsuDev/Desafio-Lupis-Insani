import { WolvesChannel } from '../channels/WolvesChannel'
import { ChatManager } from '../managers/Chat.manager'
import type { Event } from '../types/events.types'

/**
 * En el Router se separan los eventos que vienen del channel por categoría
 */
export class WolvesEventRouter {
    private channel: WolvesChannel

    constructor(gameId: number, channel: WolvesChannel) {
        this.channel = channel
    }

    routeEvent(event: string, data: Event): void {
        const category = event.split('.')[0]

        switch (category) {
            case 'chat':
                // Pasar 'wolves' para que ChatManager sepa dónde mostrar
                ChatManager.handleEvent(event, data, 'wolves')
                break

            default:
                console.warn(`⚠️ Evento sin manager asignado: ${event}`, data)
        }
    }

    public disconnect(): void {
        this.channel.leave()
    }
}
