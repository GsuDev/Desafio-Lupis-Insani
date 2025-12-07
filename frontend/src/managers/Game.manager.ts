import { ChatController } from '../controllers/GameChatController'
import { gameController } from '../controllers/GameController'
import type { Message } from '../models/models'
import type { ChatEvent, Event } from '../types/events.types'
import { GameOverContainer } from '../components/gameOverContainer/gameOverContainer'
import type { GameOverData } from '../components/gameOver/gameOverDetails'

/**
 * En el manager se separan los eventos que vienen del router
 * por evento dentro de una categoría.
 */
export class GameManager {
    static handleEvent(
        eventName: string,
        event: any /*ChatEvent*/,
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
            //hu 45 pantalla game over
            case 'game.conditions':
                console.log('🏁 Evento de fin de partida recibido:', event.data)

                //  Verificamos si hay un ganador según contrato backend
                // El backend envía winner: 'wolves' | 'villagers' | null
                if (event.data.winner) {
                    const rootNode =
                        document.getElementById('app') || document.body

                    const gameOverData: GameOverData = event.data

                    const gameOverModal = new GameOverContainer(
                        rootNode,
                        gameOverData
                    )

                    gameOverModal.render()
                }
                break

            case 'game.example':
                // Cambiar para añadir
                break

            default:
                console.warn(`⚠️ Evento de chat no manejado: ${event}`)
        }
    }
}
