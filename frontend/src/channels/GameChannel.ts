import type { EventData } from '../interfaces/EventData'
import { GameEventRouter } from '../eventRouters/GameEvent.router'
import echo from '../services/echo'

/**
 * GameChannel gestiona la conexión al canal público del juego
 * usando Reverb/Laravel Echo
 *
 * Todos los jugadores (lobos y humanos) pueden conectarse
 */
export class GameChannel {
    private gameId: number
    private router: GameEventRouter | null = null

    /**
     * Constructor recibe el ID del juego
     * Automáticamente se suscribe al canal
     */
    constructor(gameId: number) {
        this.gameId = gameId
        this.subscribe()
    }

    /**
     * Realiza la conexión real con el backend
     * usando Laravel Echo y Reverb
     */
    private subscribe(): void {
        // El nombre del canal debe coincidir con lo que Laravel define:
        // ej: 'game.1' para gameId = 1
        const channelName = `game.${this.gameId}`

        // .private() indica que es un canal privado
        // (todos pueden entrar, pero Laravel autentica que son jugadores del juego)
        echo.private(channelName).listenToAll(
            (eventName: string, data: EventData) => {
                // Limpiar el nombre del evento si viene con punto inicial
                // A veces Laravel/Reverb añade un punto al inicio
                let cleanEventName = eventName
                if (cleanEventName.startsWith('.')) {
                    cleanEventName = cleanEventName.substring(1)
                }

                console.log(
                    `🎮 Evento recibido en ${channelName}:`,
                    cleanEventName,
                    data
                )

                // Crear el router UNA SOLA VEZ y reutilizarlo
                // Esto evita crear instancias múltiples innecesariamente
                if (!this.router) {
                    this.router = new GameEventRouter(this.gameId, this)
                }

                // Pasar el evento al router para que lo procese
                this.router.routeEvent(cleanEventName, data)
            }
        )

        console.log(`🎮 Conectado al canal público: ${channelName}`)
    }

    /**
     * Método público para desconectarse del canal
     * Importante llamarlo cuando el usuario sale de la partida
     * para no gastar recursos innecesarios
     */
    public leave(): void {
        const channelName = `game.${this.gameId}`
        echo.leave(channelName)
        this.router = null
        console.log(`👋 Desconectado del canal: ${channelName}`)
    }

    /**
     * Obtener el ID del juego
     */
    public getGameId(): number {
        return this.gameId
    }

    /**
     * Obtener el router actual
     */
    public getRouter(): GameEventRouter | null {
        return this.router
    }
}
