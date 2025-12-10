import apiClient from '../services/apiClient'
import type { ApiErrorResponse } from '../types/api.types'
import type { EventPayload } from '../types/events.types'
import type { VoidResponse } from '../types/response.types'

/**
 * Provider para enviar mensajes al canal PÚBLICO (game/general)
 * Los mensajes en este canal son visibles para todos los jugadores
 */

export async function emitGameEvent(
    gameId: number,
    eventName: string,
    payload: EventPayload
): Promise<boolean> {
    try {
        const url = `/games/${gameId}/game/send`
        const { data: emitResponse } = await apiClient.post<
            VoidResponse | ApiErrorResponse
        >(url, {
            event: eventName,
            data: payload,
            gameId: gameId,
        })

        console.log(`📨 Mensaje enviado a Game Channel (${gameId}):`, payload)
        return emitResponse.success
    } catch (error) {
        console.error('❌ Error enviando a Game Channel:', error)
        return false
    }
}

/**
 * Método para enviar eventos al canal PRIVADO (wolves)
 * Solo los jugadores con rol de lobo ven estos mensajes
 */
export async function emitWolvesEvent(
    gameId: number,
    eventName: string,
    payload: EventPayload
): Promise<boolean> {
    try {
        const url = `/games/${gameId}/wolves/send`
        const { data } = await apiClient.post<VoidResponse | ApiErrorResponse>(
            url,
            {
                event: eventName,
                data: payload,
                gameId: gameId,
            }
        )

        console.log(`📨 Mensaje enviado a Wolves Channel (${gameId}):`, payload)
        return data.success
    } catch (error) {
        console.error('❌ Error enviando a Wolves Channel:', error)
        return false
    }
}
