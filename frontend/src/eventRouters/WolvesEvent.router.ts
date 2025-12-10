import { WolvesChannel } from '../channels/WolvesChannel'
import { ChatManager } from '../managers/Chat.manager'
import { GameManager } from '../managers/Game.manager'
import { VoteManager } from '../managers/Vote.manager'
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
            case 'game':
                // Pasar 'game' para que el Manager
                GameManager.handleEvent(event, data, 'game')
                break
            case 'vote':
                // Pasar 'game' para que VoteManager sepa que va a la pestaña general
                VoteManager.handleEvent(event, data, 'wolves')
                break
            default:
                console.warn(`⚠️ Evento sin manager asignado: ${event}`, data)
        }
    }

    public disconnect(): void {
        this.channel.leave()
    }
}
