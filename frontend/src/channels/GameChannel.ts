import type { EventData } from '../interfaces/EventData'
import { GameEventRouter } from '../eventRouters/GameEventRouter'
import echo from '../services/echo'

export class GameChannel {
    private gameId: number
    private router: GameEventRouter | null = null

    constructor(gameId: number) {
        this.gameId = gameId
        this.subscribe()
    }

    private subscribe(): void {
        const channelName = `game.${this.gameId}`

        echo.private(channelName).listenToAll(
            (eventName: string, data: EventData) => {
                let cleanEventName = eventName
                if (cleanEventName.startsWith('.')) {
                    cleanEventName = cleanEventName.substring(1)
                }

                // Crear router UNA SOLA VEZ y reutilizarlo
                if (!this.router) {
                    this.router = new GameEventRouter(this.gameId, this)
                }

                this.router.routeEvent(cleanEventName, data)
            }
        )

        console.log(`🎮 conectado al canal de la partida: ${channelName}`)
    }

    public leave(): void {
        const channelName = `game.${this.gameId}`
        echo.leave(channelName)
        this.router = null
        console.log(`👋 desconectado del canal público: ${channelName}`)
    }
}
