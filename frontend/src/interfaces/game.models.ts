import type { Participant } from '../models/Participant'
/**
 * Modelos de Dominio del Frontend
 * (Sincronizados con la API del Backend)
 */

export type Player = {
    id: number
    name: string
} // De forma temporal ya que necesito crear uno vacio

export type Message = {
    id: number
    message: string
    createdAt: string
    gameId: number
    playerName: string
}

export type Game = {
    id: number
    started: boolean
    ended: boolean
    url: string
    players: Player[]
    messages: Message[]
    participants: Participant[] //TOCADO
    createdAt: string
}
