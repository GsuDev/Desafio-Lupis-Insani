import type { EventData } from './EventData'

// función que recibe (nombre del evento, datos) y no devuelve nada (void)
export type EventHandler = (eventName: string, data: EventData) => void
