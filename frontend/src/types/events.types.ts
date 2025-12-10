// Todo lo relacionado con eventos

import type { Message } from '../models/models'

export type EventPayload = Record<string, unknown>
export type Event<T = null> = {
    event: string
    gameId: number
    data: T | null
}
export type NarratorEvent = Event<{ message: string; phase: string }>

export type ChatEvent = Event<{ message: Message }>
export type EventHandler = (eventName: string, data: Event) => void

export type ChatData = {
    gameId: number
    message: string
    userId: number
}
