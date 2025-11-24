import type { Game, Player, IMessageData } from '../interfaces/game.models'
import type { Participant } from '../models/Participant'
import apiClient from '../services/apiClient'


/**
 * --- PROVEEDOR DE API REAL ---
 * * Este provider reemplaza al MOCK.
 * Hace llamadas 'fetch' reales a tu API de Laravel.
 */

// Define la URL base de tu API de Laravel
// (Con 'php artisan serve' normalmente es 8000)
const apiUrl = '/api'

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
    
    // 1. Lanzamos las 3 peticiones en paralelo con Axios
    const requestGame = apiClient.get<Game>(`/games/${gameId}`)
    //const requestPlayers = apiClient.get<Player[]>(`/games/${gameId}/players`)
    const requestParticipants =  await apiClient.get<Participant[]>(
        `/games/${gameId}/participants`
    )
    const requestMessages = apiClient.get<IMessageData[]>(`/games/${gameId}/messages`)

    // 2. Esperamos a que terminen todas
    const [gameResponse, /*playersResponse,*/ participantsResponse,messagesResponse] = await Promise.all([
        requestGame,
        // requestPlayers,
        requestParticipants,
        requestMessages
    ])

    // 3. Extraemos la data de cada respuesta de Axios
    const gameData = gameResponse.data
    // const playersData = playersResponse.data
    const participantsData = participantsResponse.data
    const messagesData = messagesResponse.data

    // 4. Mapeamos al objeto final
    // Nota: Si gameData ya trae todo lo necesario, podrías hacer spread (...gameData),
    // pero mantenemos tu asignación manual por seguridad.
    const game: Game = {
        id: gameData.id,
        started: gameData.started,
        ended: gameData.ended,
        url: gameData.url,
        createdAt: gameData.createdAt,
        
        // Asignamos los arrays obtenidos de las otras llamadas
        // players: playersData, 
        messages: messagesData, 
        
        participants: participantsData// Tu valor por defecto
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
): Promise<IMessageData> => {
    
    // Construimos el objeto (Payload)
    // Axios se encargará de convertirlo a JSON automáticamente
    const payload = {
        userId,
        type: 'MESSAGE',
        message: messageContent,
    }

    // Realizamos la petición POST
    // <IMessageData> indica a TypeScript qué tipo de dato nos devuelve el servidor en 'response.data'
    const response = await apiClient.post<IMessageData>(
        `/games/${gameId}/messages`, 
        payload
    )

    return response.data
}

export const addPlayerToGame = async (
    gameId: string,
    playerName: string
): Promise<Player> => {
    
    // 1. Preparamos el payload (el cuerpo de la petición)
    const payload = { name: playerName }

    // 2. Hacemos el POST usando el cliente de Axios
    // apiClient.post<TipoRespuesta>(url, datos)
    const response = await apiClient.post<Player>(
        `/games/${gameId}/players`, 
        payload
    )

    // 3. Devolvemos los datos limpios
    return response.data
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
    
    // Realizamos la petición GET usando apiClient
    // <Participant[]> le dice a TS que esperamos recibir un array de participantes
    const response = await apiClient.get<Participant[]>(
        `/games/${gameId}/participants`
    )

    // Devolvemos directamente los datos (Axios ya parseó el JSON)
    return response.data
}
