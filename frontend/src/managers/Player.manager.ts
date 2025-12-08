import { GameComponent } from '../components/game/game'

/**
 * PlayerManager maneja todos los eventos relacionados con jugadores
 * Separados por tipo de evento dentro de la categoría 'player'
 */
export class PlayerManager {
    static handleEvent(
        eventName: string,
        event: any,
        channel: 'game' | 'wolves'
    ): void {
        // Validación básica de datos
        // A veces el backend manda la data directa o dentro de una propiedad data
        const eventData = event.data || event

        if (!eventData) {
            console.warn(`⚠️ PlayerManager: datos vacíos para ${eventName}`)
            return
        }

        switch (eventName) {
            case 'player.left':
                console.log('👋 Jugador abandonó la partida:', eventData)
                this.handlePlayerLeft(eventData)
                break

            case 'player.joined':
                console.log('👤 Jugador se unió:', eventData)
                // Aquí podríamos actualizar la lista de jugadores en el futuro
                break

            default:
                console.warn(`⚠️ Evento de player no manejado: ${eventName}`)
        }
    }

    /**
     * Maneja cuando un jugador abandona la partida
     */
    private static handlePlayerLeft(data: any): void {
        // El backend ya marcó al participante como muerto en la BD.
        // Nosotros solo actualizamos la UI para que aparezca el fantasma inmediatamente.
        GameComponent.updateParticipantsDeadStatus()
    }
}
