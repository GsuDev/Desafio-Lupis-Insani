import { ChatController } from '../controllers/GameChatController'
import { gameController } from '../controllers/GameController'
import type { Message } from '../models/models'
import type { ChatEvent, Event } from '../types/events.types'
import { GameOverContainer } from '../components/gameOverContainer/gameOverContainer'
import type { GameOverData } from '../components/gameOver/gameOverDetails'
import type { ApiResponse } from '../types/api.types'
import { GameComponent } from '../components/game/game'

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
            console.warn(`⚠️ GameManager: datos vacíos para ${event}`)
            return
        }

        switch (eventName) {
            case 'game.day':
                console.log('☀️ Evento de DÍA recibido:', event.data)
                GameComponent.handleDayPhase(event.data)
                GameComponent.handleVoteEnd // 🔥 Cerrar cualquier votación activa
                break

            case 'game.night':
                console.log('🌙 Evento de NOCHE recibido:', event.data)
                GameComponent.handleNightPhase(event.data)
                GameComponent.handleVoteEnd // 🔥 Cerrar cualquier votación activa
                break

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
                if (event.data.data.winner) {
                    console.log('Hay ganador')
                    const rootNode =
                        document.getElementById('app') || document.body

                    console.log('deberia ser app', rootNode)
                    const gameOverData: ApiResponse<GameOverData> = event.data
                    console.log('Datos: ', gameOverData)
                    if (!gameOverData || !gameOverData.data) {
                        console.log('error al terminar la partida')
                        return
                    }
                    const gameOverModal = new GameOverContainer(rootNode, {
                        winner: gameOverData.data.winner,
                        alive_wolves: gameOverData.data.alive_wolves,
                        alive_villagers: gameOverData.data.alive_villagers,
                        reason: gameOverData.message ?? 'Fin de la Partida',
                    })

                    gameOverModal.render()
                }
                break

            case 'game.example':
                // Cambiar para añadir
                break

            default:
                console.warn(`⚠️ Evento de game no manejado: ${event}`)
        }
    }
}
