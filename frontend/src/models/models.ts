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
    userId: number | null
    isBot: boolean
    isHost: boolean
    nickname: string
    characterId: number | null
    profileUrl: string | null
    states: string[]
}

export type GameData = {
    id: number
    state: string
    url: string
}

export type Game = {
    id: number
    state: string
    url: string
    messages: Message[]
    participants: Participant[]
}

export type Message = {
    id: number
    gameId: number // TODO: (prioridad ultra baja) No hace falta, al enviar el evento va en la url
    type: string
    userId: number
    nickname: string
    profileUrl: string | null
    time: string
    message: string
}

export interface SlideData {
    stepNumber: number
    title: string
    description: string
    imageName: string
}

export type GameStatistic = {
    gameId: number
    characterId: number
    characterName: string
    won: boolean
}

export type UserStatisticsData = {
    totalGames: number
    totalWins: number
    games: GameStatistic[]
}
