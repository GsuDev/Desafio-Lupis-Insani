/**
 * --- CONTROLADOR DEL JUEGO ---
 * * Este archivo maneja la lógica de negocio (estado, llamadas a la API)
 * para la Sala de Espera (WaitingRoom).
 * * NO TOCA EL DOM. En su lugar, llama a callbacks que la Vista (waitingRoom.ts) le proporciona.
 */

import type { Game } from '../interfaces/game.models'
import { getGame } from '../providers/game.provider' // Importamos el provider REAL

// --------------------------------------------------
// 1. Almacenamiento de Callbacks de la Vista
// --------------------------------------------------
// Estas variables "recuerdan" las funciones que la vista nos pasó.

let _showLoading: (isLoading: boolean) => void
let _showGlobalError: (message: string) => void
let _renderGameDetails: (game: Game) => void
let _disableStartButton: (isDisabled: boolean) => void

/**
 * La Vista (waitingRoom.ts) llama a esta función para "conectar"
 * sus funciones de actualización del DOM con este controlador.
 */
export const initGameController = (
    showLoadingCallback: (isLoading: boolean) => void,
    showGlobalErrorCallback: (message: string) => void,
    renderGameDetailsCallback: (game: Game) => void,
    disableStartButtonCallback: (isDisabled: boolean) => void
) => {
    _showLoading = showLoadingCallback
    _showGlobalError = showGlobalErrorCallback
    _renderGameDetails = renderGameDetailsCallback
    _disableStartButton = disableStartButtonCallback
}

// --------------------------------------------------
// 2. Funciones de Lógica (llamadas por la Vista)
// --------------------------------------------------

/**
 * La Vista llama a esta función cuando necesita cargar los datos.
 */
export const handleLoadGame = async (gameId: string) => {
    // 1. Informar a la vista que estamos cargando
    _showLoading(true)
    _showGlobalError('') // Limpiar errores antiguos
    _disableStartButton(true)

    try {
        // 2. Llamar al Provider (la API real)
        // (Este 'getGame' es la función inteligente que
        // trae partida, jugadores y mensajes)
        const game = await getGame(gameId)

        // 3. Si todo va bien, pasar los datos a la vista para que pinte
        _renderGameDetails(game)

        // (Añadir lógica, ej: si game.players.length < 2,
        // deshabilitar el botón de inicio)
        _disableStartButton(false)
    } catch (error: any) {
        // 4. Si hay un error, informar a la vista
        _showGlobalError(`Error al cargar la partida: ${error.message}`)
        // Console.error(error)
    } finally {
        // 5. Informar a la vista que hemos terminado de cargar
        _showLoading(false)
    }
}

/**
 * La Vista llama a esta función cuando se pulsa "Iniciar"
 */
export const handleStartGame = () => {
    _disableStartButton(true)
    _showLoading(true) // O mostrar un mensaje "Iniciando..."

    // console.log('Controlador: Lógica para iniciar el juego...')

    // (Aquí iría la llamada a la API para iniciar el juego)
    // ej: await updateGame(gameId, { status: 'starting' });

    // Simulamos que tarda 1 segundo
    setTimeout(() => {
        // Console.log('Controlador: ¡Juego iniciado!')
        // (Aquí redirigiríamos a la pantalla de juego)
        // ej: _showGlobalMessage('¡Juego iniciado! Redirigiendo...', true);

        // Por ahora, solo reactivamos el botón
        _disableStartButton(false)
        _showLoading(false)
    }, 1000)
}

// (Aquí iría 'handleSendMessage' para el chat )
