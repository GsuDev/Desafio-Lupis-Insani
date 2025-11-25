import apiClient from '../services/apiClient'
import type { WolvesChatResponse } from '../interfaces/wolvesChatResponse'
import type { ChatPayload } from '../interfaces/chatPayload'

export class GameChatEmitProvider {
    private gameId: number

    constructor(gameId: number) {
        this.gameId = gameId
    }

    async emit(eventName: string, payload: ChatPayload): Promise<boolean> {
        try {
            const url = `/games/${this.gameId}/wolves/message`
            const { data } = await apiClient.post<WolvesChatResponse>(url, {
                event: eventName,
                data: payload,
            })
            return data.success
        } catch (error) {
            console.error('Error inesperado', error)
            return false
        }
    }
}
