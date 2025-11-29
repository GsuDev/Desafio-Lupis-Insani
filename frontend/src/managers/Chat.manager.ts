import { ChatController } from '../controllers/GameChatController'
import { gameController } from '../controllers/GameController'
import type { Message } from '../models/models'
import type { ChatEvent, Event } from '../types/events.types'

/**
 * En el manager se separan los eventos que vienen del router
 * por evento dentro de una categoría.
 */
export class ChatManager {
    /**
     * Determina en qué pestaña aparecer el mensaje según el canal
     */
    static getTargetTab(
        event: string,
        channel: 'game' | 'wolves'
    ): 'general' | 'wolves' {
        // Los mensajes del canal wolves van a la pestaña de lobos
        if (channel === 'wolves') return 'wolves'
        // Los del canal game y global van a general
        return 'general'
    }

    static handleEvent(
        eventName: string,
        event: ChatEvent,
        channel: 'game' | 'wolves'
    ): void {
        if (!event.data) {
            console.warn(`⚠️ ChatManager: datos vacíos para ${event}`)
            return
        }

        switch (eventName) {
            case 'chat.message':
                ChatController.addMessage(event.data.message, channel)
                break

            case 'chat.deleted':
                console.log(`🗑️ mensaje eliminado en ${channel}:`, event)

                break

            default:
                console.warn(`⚠️ Evento de chat no manejado: ${event}`)
        }
    }
}
