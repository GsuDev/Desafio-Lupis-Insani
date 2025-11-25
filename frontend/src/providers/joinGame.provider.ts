import apiClient from '../services/apiClient'
import type { IJoinGameResponse } from '../interfaces/JoinGameResponse'

export async function joinGameRequest(
    gameId: string
): Promise<IJoinGameResponse> {
    const response = await apiClient.post<IJoinGameResponse>(
        `/games/${gameId}/join`
    )

    return response.data
}
