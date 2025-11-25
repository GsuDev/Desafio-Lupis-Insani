import type { EventData } from '../interfaces/EventData'
import apiClient from '../services/apiClient'

// Respuesta estándar del backend
interface WolvesEventResponse {
    success: boolean
    message: string
    data: null
}

/**
 * Envía un evento al canal público game.{id}
 */
export async function emitWolvesEvent(
    gameId: number,
    event: string,
    data: EventData = null
): Promise<boolean> {
    const response = await apiClient.post<WolvesEventResponse>(
        `/games/${gameId}/wolves/send`,
        {
            event,
            data,
            gameId,
        }
    )

    return response.data.success
}
