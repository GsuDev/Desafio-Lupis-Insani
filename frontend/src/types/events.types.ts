// Todo lo relacionado con eventos

import type { Message } from '../models/models'

export type EventPayload = Record<string, unknown>
export type EventData<T = null> = {
    event: string
    gameId: number
    data: T | null
}
export type ChatEvent = EventData<{ message: Message }>
export type EventHandler = (eventName: string, data: EventData) => void
