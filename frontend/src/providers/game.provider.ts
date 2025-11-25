import type {
    Game,
    Player,
    IMessageData,
    RawMessageData,
    RawResponseMessageData,
    GameRaw,
    RawParticipantsData,
} from '../interfaces/game.models'
import type { Participant } from '../models/Participant'
import apiClient from '../services/apiClient'
import type { IJoinGameResponse } from '../interfaces/JoinGameResponse'

/**
 * --- PROVEEDOR DE API ---

 */

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
    const requestGame = apiClient.get<GameRaw>(`/games/${gameId}`)
    //const requestPlayers = apiClient.get<Player[]>(`/games/${gameId}/players`)
    const requestParticipants = await apiClient.get<RawParticipantsData>(
        `/games/${gameId}/participants`
    )
    const requestMessages = apiClient.get<RawResponseMessageData>(
        `/games/${gameId}/messages`
    )

    // 2. Esperamos a que terminen todas
    const [
        gameResponse,
        /*playersResponse,*/ participantsResponse,
        messagesResponse,
    ] = await Promise.all([
        requestGame,
        // requestPlayers,
        requestParticipants,
        requestMessages,
    ])

    // 3. Extraemos la data de cada respuesta de Axios

    const gameData: Game = gameResponse.data.data.game

    /*
        let gameData = ''
    // 3. Extraemos la data de cada respuesta de Axios
    if(gameResponse && gameResponse.data && gameResponse.data.data){
        gameData = gameResponse.data.data
    }
    */
    // const playersData = playersResponse.data
    const participantsData: Participant[] =
        participantsResponse.data.data.particpants
    const messagesData: RawMessageData[] = messagesResponse.data.data.messages

    let messagesMapped: IMessageData[] = []

    // 4. Mapeamos al objeto final

    messagesData.forEach((messageData) => {
        const modifiedMsg: IMessageData = {
            id: Number(messageData.id),
            message: messageData.message,
            createdAt: messageData.time,
            gameId: Number(gameId),
            playerName: messageData.user,
            imageUrl: 'none', // sustituir por el enlace del player
        }
        messagesMapped.push(modifiedMsg)
    })
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
        messages: messagesMapped,

        participants: participantsData, // Tu valor por defecto
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

export async function joinGameRequest(gameId: string): Promise<Game> {
    const gameResponse = await apiClient.post<IJoinGameResponse>(
        `/games/${gameId}/join`
    )
    const messagesResponse = await apiClient.get<RawResponseMessageData>(
        `/games/${gameId}/messages`
    )

    const gameData = gameResponse.data.data.game
    const messagesData: RawMessageData[] = messagesResponse.data.data.messages

    let messagesMapped: IMessageData[] = []

    messagesData.forEach((messageData) => {
        const modifiedMsg: IMessageData = {
            id: Number(messageData.id),
            message: messageData.message,
            createdAt: messageData.time,
            gameId: Number(gameId),
            playerName: messageData.user,
            imageUrl: 'none', // sustituir por el enlace del player
        }
        messagesMapped.push(modifiedMsg)
    })

    const game: Game = {
        id: gameData.id,
        started: gameData.started,
        ended: gameData.ended,
        url: gameData.url,
        createdAt: gameData.createdAt,
        // Asignamos los arrays obtenidos de las otras llamadas
        // players: playersData,
        messages: messagesMapped,
        participants: gameData.participants, // Tu valor por defecto
    }

    return game
}
