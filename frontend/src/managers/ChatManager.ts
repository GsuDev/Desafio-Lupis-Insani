import type { EventData } from '../interfaces/EventData'

export class ChatManager {
    static handleEvent(event: string, data: EventData): void {
        // Evitar que se procese el mismo evento múltiples veces
        if (!data) {
            console.warn(`⚠️ ChatManager: datos vacíos para ${event}`)
            return
        }

        switch (event) {
            case 'chat.message':
                console.log('📝 mensaje Recibido:', data)
                // Aquí emitir evento personalizado para que la UI lo reciba
                window.dispatchEvent(
                    new CustomEvent('chatMessageReceived', { detail: data })
                )
                break

            case 'chat.deleted':
                console.log('🗑️ mensaje eliminado:', data)
                window.dispatchEvent(
                    new CustomEvent('chatMessageDeleted', { detail: data })
                )
                break

            default:
                console.warn(`⚠️ Evento de chat no manejado: ${event}`)
        }
    }
}
