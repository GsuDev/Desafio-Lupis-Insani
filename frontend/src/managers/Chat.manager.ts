import { ChatController } from '../controllers/GameChatController'
import type { EventData } from '../types/events.types'

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
        event: string,
        data: EventData,
        channel: 'game' | 'wolves'
    ): void {
        if (!data) {
            console.warn(`⚠️ ChatManager: datos vacíos para ${event}`)
            return
        }

        switch (event) {
            case 'chat.message':
                console.log(`📝 mensaje Recibido en ${channel}:`, data)

                ChatController.addMessage(data, channel)
                break

            case 'chat.deleted':
                console.log(`🗑️ mensaje eliminado en ${channel}:`, data)

                break

            default:
                console.warn(`⚠️ Evento de chat no manejado: ${event}`)
        }
    }
}
