import { ChatController } from '../controllers/GameChatController'
import { gameController } from '../controllers/GameController'
import type { Message } from '../models/models'
import type { ChatEvent, Event } from '../types/events.types'

/**
 * En el manager se separan los eventos que vienen del router
 * por evento dentro de una categoría.
 */
export class GameManager {
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
            case 'game.discussion':
                // TODO: Sacar un enorme titulo para lobos o aldeanos
                console.log(
                    'Empieza la discusion: Cambiame por humo',
                    event.data
                )
                break

            case 'game.example':
                // Cambiar para añadir
                break

            default:
                console.warn(`⚠️ Evento de chat no manejado: ${event}`)
        }
    }
}
