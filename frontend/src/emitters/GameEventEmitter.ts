import type { EventData } from '../interfaces/EventData'
import apiClient from '../services/apiClient'

// Respuesta estándar del backend
interface GameEventResponse {
    success: boolean
    message: string
    data: null
}

/**
 * Envía un evento al canal público game.{id}
 */
export async function emitGameEvent(
    gameId: number,
    event: string,
    data: EventData = null
): Promise<boolean> {
    const response = await apiClient.post<GameEventResponse>(
        `/games/${gameId}/send`,
        {
            event,
            data,
            gameId,
        }
    )

    return response.data.success
}
