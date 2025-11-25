import type { Participant } from '../models/Participant'

/**
 * Modelos de Dominio del Frontend
 * (Sincronizados con la API del Backend)
 */

export type Player = {
    id: number
    name: string
} // De forma temporal ya que necesito crear uno vacio

export type IMessageData = {
    id: number
    message: string
    createdAt: string
    gameId: number
    playerName: string
    imageUrl: string
}

export interface RawResponseMessageData {
    success: boolean
    message: string
    data: {
        messages: RawMessageData[]
    }
}

export interface RawMessageData {
    id: string
    message: string
    time: string
    user: string
}

export interface RawParticipantsData {
    succes: boolean
    message: string
    data: {
        particpants: Participant[]
    }
}

// export type IJoinGameResponse = {
//     success: boolean
//     message: string
//     data: {
//         game: Game
//     }
// }

export type GameRaw = {
    success: boolean
    message: string
    data: {
        game: Game
    }
}

export type Game = {
    id: number
    started: boolean
    ended: boolean
    url: string
    // players: Player[]
    messages: IMessageData[]
    participants: Participant[] //TOCADO
    createdAt: string
}
