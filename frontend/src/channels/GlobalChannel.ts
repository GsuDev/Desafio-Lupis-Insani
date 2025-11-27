import { GlobalEventRouter } from '../eventRouters/GlobalEvent.router'
import echo from '../services/echo'
import type { EventData } from '../types/events.types'

/**
 * GlobalChannel gestiona la conexión al canal público global
 * usando Reverb/Laravel Echo
 *
 * Todos los usuarios (autenticados y no autenticados) pueden escuchar
 */

export class GlobalChannel {
    private router: GlobalEventRouter | null = null
    private static instance: GlobalChannel

    //En un principio no hace falta ningún parametro adicional

    //Patron singleton para que solo haya una estancia (se puede eliminar)
    public static getInstance(): GlobalChannel {
        if (!GlobalChannel.instance) {
            GlobalChannel.instance = new GlobalChannel()
        }
        return GlobalChannel.instance
    }
    //creo el constructor privado, automaticamente se suscribe al canal
    private constructor() {
        this.subscribe()
    }

    //Aqui se conecta con el backend
    private subscribe(): void {
        const channelName = 'global'

        //como es mensajeria global (mensajes del sistema), es publico
        echo.channel(channelName).listenToAll(
            (eventName: string, data: EventData) => {
                //Limpia el nombre del evento
                let cleanEventName = eventName
                if (cleanEventName.startsWith('.')) {
                    cleanEventName = cleanEventName.substring(1)
                }
                //Eliminar cuando termine la fase de development
                console.log(
                    `📢 Evento recibido en ${channelName}:`,
                    cleanEventName,
                    data
                )

                //Crear el router una ver y reutilizarlo, para no producir fallos
                if (!this.router) {
                    this.router = new GlobalEventRouter(this)
                }

                //paso el evento que ha sucedido al router para que lo procese
                this.router.routeEvent(cleanEventName, data)
            }
        )
        console.log(`📢 Conectado al canal público: ${channelName}`)
    }

    //para salir del canal
    public leave(): void {
        const channelName = 'global'
        echo.leave(channelName)
        this.router = null
        console.log(`👋 Desconectado del canal: ${channelName}`)
    }

    //obtener el router actual
    public getRouter(): GlobalEventRouter | null {
        return this.router
    }
}
