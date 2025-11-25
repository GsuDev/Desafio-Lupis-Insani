import { WolvesEventRouter } from '../eventRouters/WolvesEventRouter'
import type { EventData } from '../interfaces/EventData'
import echo from '../services/echo'

export class WolvesChannel {
    private gameId: number
    private router: WolvesEventRouter | null = null
    //el constructor recibe la id y la funcion para avisar cuando llegue algo
    constructor(gameId: number) {
        this.gameId = gameId

        //cuando se crea la clase nos subscribimos automaticamente
        this.subscribe()
    }

    // para realizar la conexion real
    private subscribe(): void {
        // el nombre del canal igual que en laravel
        // si el id es 1, el canal se llamara 'wolves.1'
        const channelName = `wolves.${this.gameId}`

        // usamos .private() porque en laravel es "new privatechannel"
        // esto hace que laravel verifique si son lobos antes de dejarnos escuchar
        echo.private(channelName)
            // .listentoall() es como una antena universal
            // escucha cualquier evento que ocurra en este canal (chat, votos, muerte)
            .listenToAll((eventName: string, data: EventData) => {
                // cuando llega un mensaje, se lo pasamos a la funcion handler
                // el "chatcontroller" o como se llame que se hara en otra hu recibira esto y pintara el mensaje
                // se quita el punto inicial si viene con el ya que a veces laravel lo pone
                let cleanEventName = eventName
                if (cleanEventName.startsWith('.')) {
                    cleanEventName = cleanEventName.substring(1)
                }

                //console.log(`📩 evento recibido en ${channelName}:`, cleanEventName, data);

                // Crear router UNA SOLA VEZ y reutilizarlo
                if (!this.router) {
                    this.router = new WolvesEventRouter(this.gameId, this)
                }

                this.router.routeEvent(cleanEventName, data)
            })

        // aviso por consola para saber que todo ha ido bien
        //console.log(`🐺 conectado al canal privado: ${channelName}`);
    }

    // metodo publico para desconectarse
    // es importante llamarlo cuando el usuario sale de la partida para no gastar recursos
    public leave(): void {
        const channelName = `wolves.${this.gameId}`
        echo.leave(channelName)
        console.log(`👋 desconectado del canal: ${channelName}`)
    }
}
