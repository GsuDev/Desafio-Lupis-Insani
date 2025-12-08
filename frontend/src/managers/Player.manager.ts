import { GameComponent } from '../components/game/game'
import { gameController } from '../controllers/GameController'

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
                this.handlePlayerJoined(eventData)
                break

            default:
                console.warn(`⚠️ Evento de player no manejado: ${eventName}`)
        }
    }

    /**
     * Maneja cuando un jugador abandona la partida
     */
    private static handlePlayerLeft(data: any): void {
        // Recargar la partida desde el servidor para actualizar la lista de participantes
        gameController.reloadCurrentGame()
        if (gameController.currentGame?.state === 'on_course') {
            GameComponent.updateParticipantsDeadStatus()
        }
    }

    /**
     * Maneja cuando un jugador se une a la partida
     */
    private static handlePlayerJoined(data: any): void {
        // Recargar la partida desde el servidor para actualizar la lista de participantes
        gameController.reloadCurrentGame()
    }
}
