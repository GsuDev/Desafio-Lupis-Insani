import type { Game, Player, Message } from '../interfaces/game.models'
import type { Participant } from '../models/Participant'

/**
 * --- MOCK DE DATOS ---
 * Simulamos los datos que devolvería la API
 */

const mockPlayers: Player[] = [
    { id: 1, name: 'Jugador 1 (Tú)' },
    { id: 2, name: 'IA_Bot_Avanzado' },
    { id: 3, name: 'ElEstratega99' },
]

const mockMessages: Message[] = [
    {
        id: 1,
        gameId: 1,
        playerName: 'Sistema',
        message: '¡Bienvenido a la sala de espera!',
        createdAt: '2023-10-27T10:00:00Z',
    },
    {
        id: 2,
        gameId: 1,
        playerName: 'IA_Bot_Avanzado',
        message: 'Saludos, humano. Listo para ser derrotado.',
        createdAt: '2023-10-27T10:01:00Z',
    },
]


//  Mock de participantes
const mockParticipants: Participant[] = [
    { id: 1, name: 'Jugador 1', isBot: false, isHost: true, characterId: 1 },
    { id: 2, name: 'Alpha Wolf #AB12', isBot: true, isHost: false, characterId: 2 },
    { id: 3, name: 'Jugador 3', isBot: false, isHost: false, characterId: 3 },
    { id: 4, name: 'Night Raven #CD34', isBot: true, isHost: false, characterId: null },
]

const mockGame: Game = {
    id: 1,
    started: false,
    ended: false,
    url: 'incredible url',
    players: mockPlayers,
    messages: mockMessages,
    participants: mockParticipants,
    createdAt: '2023-10-27T09:59:00Z',
}

/**
 * --- MOCK DE FUNCIONES DEL PROVIDER ---
 * Simulamos las llamadas a la API
 */



/**
 * Simula: GameController@getGame
 * (En esta simulación, devuelve la partida COMPLETA, incluyendo jugadores y mensajes)
 */
export const getGame = async (gameId: string): Promise<Game> => {
    // Console.log(`PROVIDER MOCK: Buscando partida con ID: ${gameId}...`)

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (gameId === '1') {
                resolve(mockGame)
            } else {
                reject(new Error('La partida simulada no existe'))
            }
        }, 1000) // 1 segundo de retraso
    })
}

/**
 * Simula GET /api/games/{id}/participants
 */
export const getGameParticipants = async (gameId: string): Promise<Participant[]> => {
    // Console.log(`PROVIDER MOCK: Obteniendo participantes de la partida ${gameId}...`)

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (gameId === '1') {
                resolve(mockParticipants)
            } else {
                reject(new Error('La partida simulada no existe'))
            }
        }, 800) // Simulamos delay de red
    })
}

/**
 * Simula: GameController@addMessageByGame
 */
export const addMessage = async (
    gameId: string,
    messageContent: string,
    playerId: number
): Promise<Message> => {
    // Console.log(`PROVIDER MOCK: Añadiendo mensaje a la partida ${gameId}...`)

    return new Promise((resolve) => {
        setTimeout(() => {
            const player = mockPlayers.find((p) => p.id === playerId)

            const newMessage: Message = {
                id: Math.floor(Math.random() * 10_000),
                gameId: Number.parseInt(gameId, 10),
                message: messageContent,
                playerName: player?.name ?? 'Jugador Anonimo',
                createdAt: new Date().toISOString(),
            }

            // Añadimos el mensaje al mock para simular persistencia
            mockGame.messages.push(newMessage)
            // Console.log('PROVIDER MOCK: Mensaje añadido', newMessage)

            resolve(newMessage)
        }, 500)
    })
}
