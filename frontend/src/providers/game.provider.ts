import type { Game, Player, Message } from '../interfaces/game.models'
import type { Participant } from '../models/Participant'

/**
 * --- PROVEEDOR DE API REAL ---
 * * Este provider reemplaza al MOCK.
 * Hace llamadas 'fetch' reales a tu API de Laravel.
 */

// Define la URL base de tu API de Laravel
// (Con 'php artisan serve' normalmente es 8000)
const apiUrl = 'http://localhost:8000/api'

/**
 * Función auxiliar para manejar errores de 'fetch'
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message ?? `Error ${response.status}`)
    }

    return response.json() as Promise<T>
}

/**
 * Llama a: GameController@getGame, getPlayersByGame, getMessagesByGame
 * * Esta es una función "inteligente":
 * 1. Obtiene los datos base de la partida (id, url, ended)
 * 2. Obtiene la lista de jugadores de esa partida
 * 3. Obtiene los mensajes de esa partida si ya tiene
 * 4. Combina todo en un solo objeto 'Game' para el frontend.
 */
export const getGame = async (gameId: string): Promise<Game> => {
    // Funciones auxiliares
    const fetchGame = async (gameId: string): Promise<Game> => {
        const response = await fetch(`${apiUrl}/games/${gameId}`)
        return handleResponse<Game>(response)
    }

    const fetchPlayers = async (gameId: string): Promise<Player[]> => {
        const response = await fetch(`${apiUrl}/games/${gameId}/players`)
        return handleResponse<Player[]>(response)
    }

    const fetchMessages = async (gameId: string): Promise<Message[]> => {
        const response = await fetch(`${apiUrl}/games/${gameId}/messages`)
        return handleResponse<Message[]>(response)
    }

    const [gameData, playersData, messagesData] = await Promise.all([
        fetchGame(gameId),
        fetchPlayers(gameId),
        fetchMessages(gameId),
    ])

    // Combina los resultados en el objeto Game del frontend
    const game: Game = {
        id: gameData.id,
        started: gameData.started,
        ended: gameData.ended,
        url: gameData.url,
        createdAt: gameData.createdAt,
        players: playersData, // Player[] esto de forma temporal, en realidad devuelve usuarios
        messages: messagesData, // La API devuelve Message[]
        participants: [], //Por ahora array vacío, se cargará con getGameParticipants
    }

    return game
}

/**
 * Llama a: GameController@addMessageByGame
 */
export const addMessage = async (
    gameId: string,
    messageContent: string,
    userId: number | undefined
): Promise<Message> => {
    // Console.log(`PROVIDER REAL: Añadiendo mensaje a la partida ${gameId}...`)

    // ¡IMPORTANTE! El backend espera 'user_id', 'type', 'message'
    // (Ajustar esto a lo que tu componente vaya a enviar)
    const payload = {
        userId,
        type: 'MESSAGE', // O el tipo que sea
        message: messageContent,
    }

    const response = await fetch(`${apiUrl}/games/${gameId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify(payload),
    })

    return handleResponse(response)
}

export const addPlayerToGame = async (
    gameId: string,
    playerName: string
): Promise<Player> => {
    // Console.log(`PROVIDER REAL: Añadiendo jugador a la partida ${gameId}...`)
    const response = await fetch(`${apiUrl}/games/${gameId}/players`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({ name: playerName }),
    })

    return handleResponse(response)
}
// --- (Aquí añadirías el RESTO de funciones del provider...) ---
// createGame, getGames, updateGame, deleteGame...

//HU7 apartado consumir api GameProvider //no se si esta bien // se puede cambiar
/**
 * Obtiene la lista FINAL de participantes de una partida
 * (usuarios + bots + personajes asignados)
 * Llama a: GET /api/games/{id}/participants
 * Se usa DESPUÉS de pulsar "Iniciar" para obtener la lista definitiva
 */
export const getGameParticipants = async (
    gameId: string
): Promise<Participant[]> => {
    const response = await fetch(`${apiUrl}/games/${gameId}/participants`)
    return handleResponse<Participant[]>(response)
}
