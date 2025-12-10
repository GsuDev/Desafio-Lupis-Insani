import { GameChat } from '../components/gameChat/gameChat'
import { WaitingRoomChat } from '../components/waitingRoomChat/waitingRoomChat'
import type { Message } from '../models/models'
import { emitGameEvent, emitWolvesEvent } from '../providers/event.provider'
import type { EventPayload } from '../types/events.types'
import { gameController } from './GameController'
import { userController } from './UserController'

/**
 * ChatController es el puente entre:
 * - La UI (GameChat) que quiere enviar mensajes
 * - Los providers (WolvesChatEmitProvider, GameChatEmitProvider) que hablan con el backend
 * - Los event routers que reciben mensajes del backend
 */
export class ChatController {
    /**
     * Escucha los custom events que dispara ChatManager
     */
    static async addMessage(
        chatEvent: Message,
        targetTab: 'game' | 'wolves' = 'game'
    ) {
        // Evento: mensaje recibido del canal wolves o game
        const user = userController.currentUser

        if (!chatEvent || !user) {
            return
        }
        const isMine = chatEvent.userId === user.id
        if (gameController.currentGame?.state === 'waiting') {
            WaitingRoomChat.addMessage(chatEvent)
        } else {
            // Añadir a la UI en la pestaña correcta
            GameChat.addMessage(chatEvent, isMine, targetTab)
        }

        console.log(`📨 Mensaje recibido en ${targetTab}:`, chatEvent.message)
    }

    /**
     * Envía un mensaje al canal de LOBOS
     */
    static async sendToWolves(text: string) {
        const game = gameController.currentGame
        const user = userController.currentUser

        console.log('que pasa aqui', game)
        console.log('que pasa aqui', user)
        if (!user || !game) {
            console.error(`❌ Error al enviar mensaje a Wolves`)
            // Mostrar alerta al usuario
            alert('Error al enviar el mensaje. Intenta de nuevo.')
            return
        }
        const payload: EventPayload = {
            gameId: game.id,
            message: text,
            userId: user.id,
        }

        console.log(`📤 Enviando a Wolves Channel...`)
        const success = await emitWolvesEvent(game.id, 'chat.message', payload)

        if (success) {
            console.log(`✅ Mensaje enviado a Wolves correctamente`)
        } else {
            console.error(`❌ Error al enviar mensaje a Wolves`)
            // Mostrar alerta al usuario
            alert('Error al enviar el mensaje. Intenta de nuevo.')
        }
    }

    /**
     * Envía un mensaje al canal PUBLIC (GAME)
     */
    static async sendToGame(text: string): Promise<void> {
        const game = gameController.currentGame
        const user = userController.currentUser

        if (!user || !game) {
            console.error(`❌ Error al enviar mensaje a Game`)
            // Mostrar alerta al usuario
            alert('Error al enviar el mensaje. Intenta de nuevo.')
            return
        }
        const payload: EventPayload = {
            gameId: game.id,
            message: text,
            userId: user.id,
        }

        console.log(`📤 Enviando a Game Channel...`)
        const success = await emitGameEvent(game.id, 'chat.message', payload)

        if (success) {
            console.log(`✅ Mensaje enviado a Game correctamente`)
        } else {
            console.error(`❌ Error al enviar mensaje a Game ${success}`)
            // Mostrar alerta al usuario
            alert('Error al enviar el mensaje. Intenta de nuevo.')
        }
    }
}
