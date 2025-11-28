// Payloads que envías al servidor en el body de las requests

export interface ChatPayload {
    gameId: number
    message: string
    userId: number
}

export interface RegisterPayload {
    nickname: string
    name: string
    lastname: string
    email: string
    password: string
    password_confirmation: string
    birthdate: string
}

export interface LoginPayload {
    email: string
    password: string
}

/**Payload para el registro de usuarios anonimos
 * el nickname es opcional si no se envia, el backend genera uno
 */

export interface AnonymousRegisterPayload {
    nickname?: string
    profile_url?: string
}
