/**
 * --- CONTROLADOR DEL JUEGO ---
 * * Esta clase maneja la lógica de negocio (estado, llamadas a la API)
 * para la Sala de Espera (WaitingRoom) y otras vistas relacionadas con el juego.
 */

import type { Game } from '../interfaces/game.models'
import { getGame } from '../providers/game.provider' // Importamos el provider REAL

class GameController {
    private static instance: GameController

    // 1. Almacenamiento de Callbacks de la Vista
    private _showLoading: (isLoading: boolean) => void = () => {}
    private _showGlobalError: (message: string) => void = () => {}
    private _renderGameDetails: (game: Game) => void = () => {}
    private _disableStartButton: (isDisabled: boolean) => void = () => {}

    private constructor() {}

    //Este es lo que sería el getGame, si jesus quiere cambiarlo a getGame
    public static getInstance(): GameController {
        if (!GameController.instance) {
            GameController.instance = new GameController()
        }
        return GameController.instance
    }

    /**
     * La Vista (waitingRoom.ts) llama a esta función para "conectar"
     * sus funciones de actualización del DOM con este controlador.
     */
    public init(
        showLoadingCallback: (isLoading: boolean) => void,
        showGlobalErrorCallback: (message: string) => void,
        renderGameDetailsCallback: (game: Game) => void,
        disableStartButtonCallback: (isDisabled: boolean) => void
    ): void {
        this._showLoading = showLoadingCallback
        this._showGlobalError = showGlobalErrorCallback
        this._renderGameDetails = renderGameDetailsCallback
        this._disableStartButton = disableStartButtonCallback
    }

    // --------------------------------------------------
    // 2. Métodos de Lógica (llamados por la Vista)
    // --------------------------------------------------

    /**
     * La Vista llama a este método cuando necesita cargar los datos.
     */
    public async handleLoadGame(gameId: string): Promise<void> {
        // 1. Informar a la vista que estamos cargando
        this._showLoading(true)
        this._showGlobalError('') // Limpiar errores antiguos
        this._disableStartButton(true)

        try {
            // 2. Llamar al Provider (la API real)
            const game = await getGame(gameId)

            // 3. Si todo va bien, pasar los datos a la vista para que pinte
            this._renderGameDetails(game)

            // (Añadir lógica, ej: si game.players.length < 2, deshabilitar el botón de inicio)
            //this._disableStartButton(game.players.length < 2)  Ejemplo de lógica
        } catch (error: any) {
            // 4. Si hay un error, informar a la vista
            this._showGlobalError(
                `Error al cargar la partida: ${error.message}`
            )
        } finally {
            // 5. Informar a la vista que hemos terminado de cargar
            this._showLoading(false)
        }
    }

    /**
     * La Vista llama a este método cuando se pulsa "Iniciar"
     */
    public handleStartGame(): void {
        this._disableStartButton(true)
        this._showLoading(true) // O mostrar un mensaje "Iniciando..."

        // ej: await updateGame() y actualizar en servidor el boolean de comenzada

        // Simulamos que tarda 1 segundo
        setTimeout(() => {
            this._disableStartButton(false)
            this._showLoading(false)
        }, 1000)
    }
}

// (Aquí iría 'handleSendMessage' para el chat )
export const gameController = GameController.getInstance()
