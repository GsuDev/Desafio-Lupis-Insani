import { WolvesEventRouter } from '../eventRouters/WolvesEvent.router'
import type { EventData } from '../interfaces/EventData'
import echo from '../services/echo'

/**
 * WolvesChannel gestiona la conexión al canal privado de lobos
 * usando Reverb/Laravel Echo
 *
 * Solo los jugadores con rol de lobo pueden conectarse
 */
export class WolvesChannel {
    private gameId: number
    private router: WolvesEventRouter | null = null

    /**
     * Constructor recibe el ID del juego
     * Automáticamente se suscribe al canal
     */
    constructor(gameId: number) {
        this.gameId = gameId

        // Cuando se crea la clase nos subscribimos automáticamente
        this.subscribe()
    }

    /**
     * Realiza la conexión real con el backend
     * usando Laravel Echo y Reverb
     */
    private subscribe(): void {
        // El nombre del canal debe coincidir con lo que Laravel define:
        // ej: 'wolves.1' para gameId = 1
        const channelName = `wolves.${this.gameId}`

        // .private() indica que es un canal privado
        // Laravel verificará que el usuario es lobo antes de permitir la conexión
        echo.private(channelName)
            // .listenToAll() es una "antena universal" que escucha todos los eventos
            // del canal sin necesidad de especificar el nombre de cada uno
            .listenToAll((eventName: string, data: EventData) => {
                // Limpiar el nombre del evento si viene con punto inicial
                // A veces Laravel/Reverb añade un punto al inicio
                let cleanEventName = eventName
                if (cleanEventName.startsWith('.')) {
                    cleanEventName = cleanEventName.substring(1)
                }

                console.log(
                    `🐺 Evento recibido en ${channelName}:`,
                    cleanEventName,
                    data
                )

                // Crear el router UNA SOLA VEZ y reutilizarlo
                // Esto evita crear instancias múltiples innecesariamente
                if (!this.router) {
                    this.router = new WolvesEventRouter(this.gameId, this)
                }

                // Pasar el evento al router para que lo procese
                this.router.routeEvent(cleanEventName, data)
            })

        console.log(`🐺 Conectado al canal privado: ${channelName}`)
    }

    /**
     * Método público para desconectarse del canal
     * Importante llamarlo cuando el usuario sale de la partida
     * para no gastar recursos innecesarios
     */
    public leave(): void {
        const channelName = `wolves.${this.gameId}`
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
    public getRouter(): WolvesEventRouter | null {
        return this.router
    }
}
