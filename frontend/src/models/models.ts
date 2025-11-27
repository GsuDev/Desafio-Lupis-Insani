/**
 * Interfaz que representa un usuario del sistema.
 * Contiene los datos básicos del usuario.
 */
export type User = {
    /** ID del usuario */
    id: number

    /** Nickname del usuario */
    nickname: string

    /** Nombre real del usuario */
    name: string

    /** Apellidos del usuario */
    lastname: string | null

    /** Correo electrónico del usuario */
    email: string | null

    /** Fecha de nacimiento en formato ISO */
    birthdate: string | null

    /** URL de la imagen de perfil */
    profile_url: string | null

    /**Indica si el usuario es anonimo */
    is_anonymous: boolean
}

export type Participant = {
    id: number
    isBot: boolean
    isHost: boolean
    nickname: string
    characterId: number | null
}

export type GameData = {
    id: number
    state: boolean
    url: string
    createdAt: string
}

export type Game = {
    id: number
    state: boolean
    url: string
    messages: Message[]
    participants: Participant[]
    createdAt: string
}

export type Message = {
    id: number
    gameId: number
    type: string
    userId: number
    nickname: string
    profileUrl: string | null
    time: string
    message: string
}

export interface SlideData {
    stepNumber: number
    tittle: string
    description: string
    imageUrl: string
}
