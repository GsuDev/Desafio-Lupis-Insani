import type {
    Game,
    GameData,
    Message,
    Participant,
    SlideData,
} from '../models/models'
import type {
    GameResponse,
    MessagesResponse,
    ParticipantsResponse,
    VoidResponse,
    GameDataResponse,
    SlidesResponse,
} from '../types/response.types'
import apiClient from '../services/apiClient'
import type { ApiErrorResponse, ApiResponse } from '../types/api.types'
import slidesData from '../assets/data/tipSlides.json'

/**
 * --- PROVEEDOR DE API ---

 */

/**
 * Llama a: GameController@getGame, getPlayersByGame, getMessagesByGame
 * Esta es una función "inteligente":
 * 1. Obtiene los datos base de la partida (id, url, ended)
 * 2. Obtiene la lista de jugadores de esa partida
 * 3. Obtiene los mensajes de esa partida si ya tiene
 * 4. Combina todo en un solo objeto 'Game' para el frontend.
 */
export const getGame = async (
    gameId: number
): Promise<GameResponse | ApiErrorResponse> => {
    try {
        // 1. Lanzamos las 3 peticiones en paralelo con Axios
        const requestGame = apiClient.get<GameDataResponse | ApiErrorResponse>(
            `/games/${gameId}`
        )

        const requestParticipants = apiClient.get<
            ParticipantsResponse | ApiErrorResponse
        >(`/games/${gameId}/participants`)
        const requestMessages = apiClient.get<
            MessagesResponse | ApiErrorResponse
        >(`/games/${gameId}/messages`)

        // 2. Esperamos a que terminen todas
        const [
            { data: gameResponse },
            { data: participantsResponse },
            { data: messagesResponse },
        ] = await Promise.all([
            requestGame,
            requestParticipants,
            requestMessages,
        ])
        // 3. Extraemos la data
        const gameData: GameData | null = gameResponse?.data?.game ?? null

        // ❗ Si no existe la partida → respuesta de error estándar
        if (!gameData) {
            return {
                success: false,
                message: gameResponse.message,
                data: null,
            }
        }

        const participantsData: Participant[] =
            participantsResponse?.data?.participants ?? []

        console.log('Participantes en el provider: ', participantsData)

        const messagesData: Message[] = messagesResponse?.data?.messages ?? []

        // 4. Parseamos a Date el time del msg
        const parseMessages = (rawMessages: Message[]): Message[] => {
            return rawMessages.map((msg) => ({
                ...msg,
                time: formatTime(msg.time),
            }))
        }

        const messages: Message[] = parseMessages(messagesData)

        const game: Game = {
            id: gameData.id,
            state: gameData.state,
            url: gameData.url,
            isPublic: gameData.isPublic,
            participants: participantsData,
            messages: messages,
        }
        console.log('Game Provider getGame()', game)

        // ✅ Respuesta API correcta
        return {
            success: true,
            message: gameResponse.message,
            data: {
                game,
            },
        }
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Unexpected error while loading game',
            data: null,
        }
    }
}

export const getParticipants = async (
    gameId: number
): Promise<ParticipantsResponse | ApiErrorResponse> => {
    try {
        const response = await apiClient.get<ParticipantsResponse>(
            `/games/${gameId}/participants`
        )

        // Devolvemos el cuerpo de la respuesta (success, data, message)
        return response.data
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error inesperado al obtener participantes',
            data: null,
        }
    }
}

/**
 * Carga los slides de tips desde tipSlides.json
 * Devuelve un objeto tipado al estilo de los otros endpoints
 */
export const getTipSlides = async (): Promise<
    SlidesResponse | ApiErrorResponse
> => {
    try {
        if (!slidesData || !Array.isArray(slidesData)) {
            return {
                success: false,
                message: 'Slides data not found or invalid',
                data: null,
            }
        }

        // ✅ Convertimos si fuera necesario (en este caso no hace falta)
        const slides: SlideData[] = slidesData.map((slide) => ({
            stepNumber: slide.stepNumber,
            title: slide.title,
            description: slide.description,
            imageName: slide.imageName.trim(), // quitamos espacios extra en URLs
        }))

        return {
            success: true,
            message: 'Slides cargadas correctamente',
            data: { slides },
        }
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error cargando slides',
            data: null,
        }
    }
}

// DEPRECATED: Ahora los mensajes van a través del event.provider.ts

// /**
//  * Llama a: GameController@addMessageByGame
//  */
// export const addMessage = async (
//     gameId: string,
//     messageContent: string,
//     userId: number | undefined
// ): Promise<IMessageData> => {
//     // Construimos el objeto (Payload)
//     // Axios se encargará de convertirlo a JSON automáticamente
//     const payload = {
//         userId,
//         type: 'MESSAGE',
//         message: messageContent,
//     }

//     // Realizamos la petición POST
//     // <IMessageData> indica a TypeScript qué tipo de dato nos devuelve el servidor en 'response.data'
//     const response = await apiClient.post<IMessageData>(
//         `/games/${gameId}/messages`,
//         payload
//     )

//     return response.data
// }

// DEPRECATED: Ahora los usuarios se registran a través del user.provider.ts

// export const addPlayerToGame = async (
//     gameId: string,
//     playerName: string
// ): Promise<Player> => {
//     // 1. Preparamos el payload (el cuerpo de la petición)
//     const payload = { name: playerName }

//     // 2. Hacemos el POST usando el cliente de Axios
//     // apiClient.post<TipoRespuesta>(url, datos)
//     const response = await apiClient.post<Player>(
//         `/games/${gameId}/players`,
//         payload
//     )

//     // 3. Devolvemos los datos limpios
//     return response.data
// }
// --- (Aquí añadirías el RESTO de funciones del provider...) ---
// createGame, getGames, updateGame, deleteGame...

// DEPRECATED: Ahora recargamos la partida entera y vienen los participantes

// //HU7 apartado consumir api GameProvider //no se si esta bien // se puede cambiar
// /**
//  * Obtiene la lista FINAL de participantes de una partida
//  * (usuarios + bots + personajes asignados)
//  * Llama a: GET /api/games/{id}/participants
//  * Se usa DESPUÉS de pulsar "Iniciar" para obtener la lista definitiva
//  */
// export const getGameParticipants = async (
//     gameId: string
// ): Promise<ParticipantsResponse | ApiErrorResponse> => {
//     try {
//         // 1. Petición al backend
//         const {data: participantsResponse} = await apiClient.get<ParticipantsResponse>(
//             `/games/${gameId}/participants`
//         )

//         const participants = participantsResponse?.data?.participants ?? []

//         // ✅ Respuesta correcta tipada
//         return {
//             success: true,
//             message: participantsResponse.message,
//             data: {
//                 participants,
//             },
//         }
//     } catch (error) {
//         return {
//             success: false,
//             message:
//                 error instanceof Error
//                     ? error.message
//                     : 'Unexpected error while loading participants',
//             data: null,
//         }
//     }
// }

/**
 * Alterna la visibilidad pública/privada de una partida
 * Endpoint: POST /games/{id}/toggle-public
 */
export async function togglePublic(
    gameId: number
): Promise<ApiResponse<{ isPublic: boolean }> | ApiErrorResponse> {
    try {
        const { data } = await apiClient.post<
            ApiResponse<{ isPublic: boolean }>
        >(`/games/${gameId}/toggle-public`)
        return data
    } catch (error) {
        console.error('❌ Error en togglePublic:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error cambiando visibilidad de partida',
            data: null,
        }
    }
}

export async function joinGameRequest(
    gameId: number
): Promise<GameResponse | ApiErrorResponse> {
    const { data: joinResponse } = await apiClient.post<VoidResponse>(
        `/games/${gameId}/join`
    )
    if (joinResponse.success) {
        const gameResponse = await getGame(gameId)
        return gameResponse
    }

    return joinResponse
}

/**
 * Formatea la fecha string "2023-11-24T10:00:00" a "10:00"
 */
const formatTime = (dateString: string): string => {
    try {
        const date = new Date(dateString)
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch (e) {
        return ''
    }
}

/**
 * Llama al endpoint para generar y asignar bots a la partida
 * Ruta: POST /api/games/{gameId}/bots
 */
export const assignBots = async (
    gameId: number
): Promise<VoidResponse | ApiErrorResponse> => {
    try {
        const response = await apiClient.post<VoidResponse>(
            `/games/${gameId}/bots`
        )
        return response.data
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : 'Error asignando bots',
            data: null,
        }
    }
}

/**
 * Actualiza el estado de la partida (ej. para iniciarla)
 * Ruta: PUT /api/games/{gameId}
 */
export const startGame = async (
    gameId: number
): Promise<GameDataResponse | ApiErrorResponse> => {
    try {
        const { data: response } = await apiClient.post<
            GameResponse | ApiErrorResponse
        >(`/games/${gameId}/start`)
        return response
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error iniciando partida',
            data: null,
        }
    }
}

/**
 * Llama al backend para repartir los roles/personajes a todos los participantes
 * Ruta sugerida: POST /api/games/{gameId}/assign-characters
 */
export const assignCharacters = async (
    gameId: number
): Promise<VoidResponse | ApiErrorResponse> => {
    try {
        const response = await apiClient.post<VoidResponse>(
            `/games/${gameId}/assign-characters`
        )
        return response.data
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error al asignar personajes',
            data: null,
        }
    }
}

export async function createGameRequest(): Promise<
    GameResponse | ApiErrorResponse
> {
    const { data: createResponse } = await apiClient.post<
        GameResponse | ApiErrorResponse
    >(`/games`)
    //TODO: Manejar fallo creacion partida
    return createResponse
}

/**
 * Obtiene la lista de partidas (Usaremos la misma que para el Lobby)
 * Endpoint: GET /games
 */
export async function getGames(): Promise<
    ApiResponse<{ games: GameData[] }> | ApiErrorResponse
> {
    try {
        const { data } =
            await apiClient.get<ApiResponse<{ games: GameData[] }>>('/games')
        return data
    } catch (error) {
        console.error('❌ Error en getGames:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error obteniendo partidas',
            data: null,
        }
    }
}

/**
 * Elimina una partida por ID (Solo Admin)
 * Endpoint: DELETE /games/{id}
 */
export async function deleteGame(
    gameId: number
): Promise<ApiErrorResponse | ApiResponse<null>> {
    try {
        const { data } = await apiClient.delete<ApiResponse<null>>(
            `/games/${gameId}`
        )
        return data
    } catch (error) {
        console.error('❌ Error en deleteGame:', error)
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Error eliminando partida',
            data: null,
        }
    }
}
