import { WolvesChannel, type WolfEventData } from '../channels/WolvesChannel'

//prueba
export interface IChatController {
    onMessageReceived(eventName: string, data: WolfEventData): void
}

export class GameChatManager {
    private gameId: number
    private wolvesChannel: WolvesChannel | null = null

    //aqui se guardara la referencia del controller
    private controller: IChatController | null = null

    constructor(gameId: number) {
        this.gameId = gameId
    }

    setController(controller: IChatController): void {
        this.controller = controller
    }

    //conectar al canal de lobos
    subscribeToWolvesChannel(): void {
        console.log('Manager: Iniciando escucha de lobos')

        //voy dejando algunos comentarios que se que no son necesarios
        //pero son para enterarme del flujo y del funcionamiento
        //ya que aun me lian bastante y asi puedo seguir el flujo
        this.wolvesChannel = new WolvesChannel(this.gameId, (event, data) =>
            this.handleWolvesEvent(event, data)
        )
    }

    //este metodo se ejecuta cada vez que wolvesChannel recibe algo del servidor
    private handleWolvesEvent(eventName: string, data: WolfEventData): void {
        console.log(`manager escuchó: ${eventName}`, data)

        if (this.controller) {
            this.controller.onMessageReceived(eventName, data)
        }
    }

    //desconectar
    disconnect(): void {
        if (this.wolvesChannel) {
            this.wolvesChannel.leave()
        }
    }
}
