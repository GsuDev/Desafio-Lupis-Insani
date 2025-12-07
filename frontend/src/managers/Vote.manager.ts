import { GameComponent } from '../components/game/game'
import type { Event } from '../types/events.types'

/**
 * VoteManager maneja todos los eventos relacionados con votaciones
 * Separados por tipo de evento dentro de la categoría vote
 */
export class VoteManager {
    static handleEvent(
        eventName: string,
        event: any,
        channel: 'game' | 'wolves'
    ): void {
        if (!event.data) {
            console.warn(`⚠️ VoteManager: datos vacíos para ${eventName}`)
            return
        }

        switch (eventName) {
            case 'vote.start':
                console.log('🗳️ Comienza período de votación:', event.data)
                GameComponent.handleVoteStart(event.data)
                break

            case 'vote.emitted':
                console.log('✅ Voto emitido:', event.data)
                GameComponent.handleVoteEmitted(event.data)
                break

            case 'vote.canceled':
                console.log('❌ Voto cancelado:', event.data)
                GameComponent.handleVoteCanceled(event.data)
                break

            case 'vote.result':
                console.log('📊 Resultado de votación:', event.data)
                // TODO HU futura: Mostrar quién fue eliminado
                GameComponent.handleVoteResult(event.data)
                break

            default:
                console.warn(`⚠️ Evento de votación no manejado: ${eventName}`)
        }
    }
}
