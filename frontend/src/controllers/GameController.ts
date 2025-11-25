/**
 * --- CONTROLADOR DEL JUEGO ---
 * * Esta clase maneja la lógica de negocio (estado, llamadas a la API)
 * para la Sala de Espera (WaitingRoom) y otras vistas relacionadas con el juego.
 */

import type { Game, IMessageData } from '../interfaces/game.models'
import { getGame, joinGameRequest } from '../providers/game.provider'

// import { joinGameRequest } from '../providers/joinGame.provider'
// Importamos el provider REAL
//import { getGame } from '../providers/game.provider.mock' // MOCK con participants para probar

class GameController {
    private static instance: GameController

    //tengo que guardar el estado de la partida
    private _currentGame: Game | null = null

    // 1. Almacenamiento de Callbacks de la Vista
    private _showLoading: (isLoading: boolean) => void = () => {}
    private _showGlobalError: (message: string) => void = () => {}
    private _renderGameDetails: (game: Game) => void = () => {}
    private _disableStartButton: (isDisabled: boolean) => void = () => {}
    private _addChatMessage: (message: IMessageData) => void = () => {}

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
        disableStartButtonCallback: (isDisabled: boolean) => void,
        addChatMessageCallback: (message: IMessageData) => void
    ): void {
        this._showLoading = showLoadingCallback
        this._showGlobalError = showGlobalErrorCallback
        this._renderGameDetails = renderGameDetailsCallback
        this._disableStartButton = disableStartButtonCallback
        this._addChatMessage = addChatMessageCallback
    }

    public setGameData(game: Game): void {
        this._currentGame = game
        //si ya estamos en la vista renderizar
        if (this._renderGameDetails) {
            this._renderGameDetails(game)
        }
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
            //Como ahora guardo en memoria
            if (
                this._currentGame &&
                this._currentGame.id.toString() === gameId
            ) {
                //console.log('Cargando datos desde memoria caché del Controller')
                this._renderGameDetails(this._currentGame)
            } else {
                // Si no, llamamos a la API
                //console.log('Fetching datos desde API...')
                const game = await getGame(gameId)
                localStorage.setItem('currentGame', JSON.stringify(game))
                // Guardamos en memoria
                this._currentGame = game
                this._renderGameDetails(game)
            }

            //        // Si no, llamamos a la API
            //     //console.log('Fetching datos desde API...')
            //     const game = await getGame(gameId)
            //     localStorage.setItem('currentGame', JSON.stringify(game))
            //     // Guardamos en memoria
            //     this._currentGame = game
            //     this._renderGameDetails(game)

            // // 2. Llamar al Provider (la API real)
            // //llama al mock //TOCADO
            // const game = await getGame(gameId)

            // // 3. Si todo va bien, pasar los datos a la vista para que pinte
            // this._renderGameDetails(game)

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
        this._showLoading(true) // O mostrar un mensaje "Iniciando..."

        // ej: await updateGame() y actualizar en servidor el boolean de comenzada

        // Simulamos que tarda 1 segundo
        setTimeout(() => {
            this._showLoading(false)
        }, 1000)
    }

    public handleNewMessage(message: IMessageData): void {
        if (this._addChatMessage) {
            this._addChatMessage(message)
        }
    }

    public async handleJoin(gameId: string): Promise<Game> {
        const response = await joinGameRequest(gameId)
        if (!response) {
            throw new Error('Error al unirse a la partida.')
        }
        localStorage.setItem('currentGame', JSON.stringify(response))

        return response
    }
}

// (Aquí iría 'handleSendMessage' para el chat )
export const gameController = GameController.getInstance()
