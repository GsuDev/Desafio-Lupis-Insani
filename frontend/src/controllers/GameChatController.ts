import { GameChat } from '../components/gameChat/gameChat'
import {
    GameChatManager,
    type IChatController,
} from '../managers/GameChatManager'
import { GameChatEmitProvider } from '../providers/gameChatEmitProvider'
import type { Message } from '../interfaces/game.models'
import { type WolfEventData } from '../channels/WolvesChannel'
import type { WolvesEventPayload } from '../interfaces/wolvesEventPayload'

// Implementamos la interfaz IChatController para cumplir el contrato con el Manager
export class GameChatController implements IChatController {
    private view: GameChat | null = null
    private manager: GameChatManager
    private provider: GameChatEmitProvider

    private gameId: number
    private playerName: string

    constructor(gameId: number, manager: GameChatManager, playerName: string) {
        this.gameId = gameId
        this.playerName = playerName

        // "contratamos al manager"
        this.manager = manager
        this.manager.setController(this)

        // "contratamos al provider"
        this.provider = new GameChatEmitProvider(gameId)
    }

    /**Conectamos la vista (GameChat) con el controller */
    public setView(view: GameChat): void {
        this.view = view
    }

    /**accion 1
     * enviar mensaje -> desde la vista hacia el backend
     * este metodo lo llamará la vista cuando des a enviar
     */

    async sendMessage(text: string): Promise<void> {
        //debug
        console.log('Controller: procesando el envio', text)

        // se prepara el paquete para el provider
        const payload = {
            message: text,
            playerName: this.playerName,
        }

        //usamos el provider para enviar
        const success = await this.provider.emit('wolves.chat', payload)

        //para probar se hara refactor luego
        if (!success) {
            alert('Error al enviar mensaje ')
        }

        //no pintamos el mensaje aqui esperamos a que vuelva por el websockets
    }

    /**
     * accion 2
     * recibit mensaje -> desde el backend hacia la vista
     * este metodo lo llama el manager cuando escucha algo
     */

    onMessageReceived(eventName: string, data: WolfEventData): void {
        //validamos que haya vista y datos
        if (!this.view || !data) return

        //filtramos solo queremos los eventos de chat
        //el nombre del evento viene del wolvesChannelcontroller en el back
        if (eventName === 'wolves.chat' || eventName === 'client-wolves.chat') {
            //convertimos los datos crudos json a interfaz messsage
            //  Convertimos el objeto genérico a nuestra interfaz
            // Usamos 'unknown' como paso intermedio obligatorio en TS
            const eventPayload = data as unknown as WolvesEventPayload

            const msg: Message = {
                id: Date.now(),
                gameId: this.gameId,
                playerName: eventPayload.data.playerName || 'Desconocido',
                message: eventPayload.data.message || '',
                createdAt: new Date().toISOString(),
                image_url: eventPayload.data.image_url,
            }

            //para que salga a la izquierda o la derecha
            const isMine = msg.playerName === this.playerName

            // Ordenamos a la Vista que pinte el mensaje
            this.view.addMessage(msg, isMine)
        }
    }
}
