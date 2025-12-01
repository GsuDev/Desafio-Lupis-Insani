/**
 * --- CONTROLADOR DEL JUEGO ---
 * * Esta clase maneja la lógica de negocio (estado, llamadas a la API)
 * para la Sala de Espera (WaitingRoom) y otras vistas relacionadas con el juego.
 */

import { GameChannel } from '../channels/GameChannel'
import type { Game, Message } from '../models/models'
import { getGame, joinGameRequest, assignBots, updateGameState } from '../providers/game.provider'

// import { joinGameRequest } from '../providers/joinGame.provider'
// Importamos el provider REAL
//import { getGame } from '../providers/game.provider.mock' // MOCK con participants para probar

class GameController {
    private static instance: GameController

    private gameChannel: GameChannel | null = null

    //tengo que guardar el estado de la partida
    private _currentGame: Game | undefined

    // 1. Almacenamiento de Callbacks de la Vista
    private _showLoading: (isLoading: boolean) => void = () => {}
    private _showGlobalError: (message: string) => void = () => {}
    private _renderGameDetails: (game: Game) => void = () => {}
    private _disableStartButton: (isDisabled: boolean) => void = () => {}
    private _addChatMessage: (message: Message) => void = () => {}

    private constructor() {}

    //Este es lo que sería el getGame, si jesus quiere cambiarlo a getGame
    public static getInstance(): GameController {
        if (!GameController.instance) {
            GameController.instance = new GameController()
        }
        return GameController.instance
    }

    get currentGame() {
        return this._currentGame
    }

    set currentGame(currentGame) {
        localStorage.setItem('currentGame', JSON.stringify(currentGame))
    }

    /** Restaura la sesión desde localStorage si existe */
    public restoreSession(): void {
        const savedGame = localStorage.getItem('currentGame')
        if (savedGame) {
            try {
                this._currentGame = JSON.parse(savedGame) as Game
            } catch {
                // Si hay error al parsear, limpiamos el localStorage
                localStorage.removeItem('currentGame')
            }
        }
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
        addChatMessageCallback: (message: Message) => void
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
    public async handleLoadGame(gameId: number): Promise<void> {
        // 1. Informar a la vista que estamos cargando
        this._showLoading(true)
        this._showGlobalError('') // Limpiar errores antiguos
        this._disableStartButton(true)
        try {
            //Como ahora guardo en memoria
            if (this._currentGame) {
                //console.log('Cargando datos desde memoria caché del Controller')
                this._renderGameDetails(this._currentGame)
            } else {
                // Si no, llamamos a la API
                //console.log('Fetching datos desde API...')
                const response = await getGame(gameId)
                if (!response.data) {
                    throw new Error('No ha llegado')
                }
                this._currentGame = response.data.game
                localStorage.setItem(
                    'currentGame',
                    JSON.stringify(this._currentGame)
                )
                // Guardamos en memoria
                this._renderGameDetails(this._currentGame)
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
    public async handleStartGame(): Promise<void> {
        // Comprobaciones de seguridad
        if (!this._currentGame) return
        
        // Evitar doble click
        this._disableStartButton(true)
        this._showLoading(true) // O mostrar un mensaje "Iniciando..."

       try {
            const gameId = this._currentGame.id
            const MIN_PLAYERS = 15 // Mínimo necesario según tus reglas
            
            // 1. Comprobar participantes y Generar Bots si es necesario
            // (Asumimos que participants ya está cargado en _currentGame)
            const currentPlayersCount = this._currentGame.participants.length

            if (currentPlayersCount < MIN_PLAYERS) {
                console.log(`Faltan jugadores (${currentPlayersCount}/${MIN_PLAYERS}). Añadiendo bots...`)
                
                const botResponse = await assignBots(gameId)
                
                if (!botResponse.success) {
                   throw new Error(botResponse.message || 'Error al generar bots')
                }
                
                // Recarga el juego aquí para ver los bots antes de cambiar de fase
                await this.handleLoadGame(gameId)
            }

            // 2. Iniciar la Partida (Cambiar estado)
            // on_course
            const startResponse = await updateGameState(gameId, 'on_course')

            if (!startResponse.success || !startResponse.data) {
                throw new Error(startResponse.message || 'Error al iniciar la partida')
            }

            console.log('✅ Partida iniciada correctamente')
            
            // 3. Actualizar el estado local
            this.setGameData(startResponse.data.game)
            
            // Aquí la vista (WaitingRoom) debería detectar el cambio de estado 
            // en el callback _renderGameDetails y cambiar la pantalla al componente de Juego.
            this._renderGameDetails(startResponse.data.game)



        } catch (error: any) {
            console.error(error)
            this._showGlobalError(error.message || 'Error desconocido al iniciar')
            this._disableStartButton(false) // Reactivar botón si falló
        } finally {
            this._showLoading(false)
        }

    }
    public handleCreateGame() {}

    public async handleJoin(gameId: number): Promise<Game> {
        console.log('handleJoin en el GameController')
        const response = await joinGameRequest(gameId)
        if (!response.data) {
            throw new Error('Error al unirse a la partida.')
        }
        this._currentGame = response.data.game
        localStorage.setItem('currentGame', JSON.stringify(response.data.game))

        return response.data.game
    }
    public connectGameChannel(gameId: number): void {
        try {
            this.gameChannel = new GameChannel(gameId)
            console.log(`✅ Game Channel conectado`, 'success')
        } catch (error) {
            console.log(`❌ Error: ${error}`, 'error')
        }
    }

    public disconnectGameChannel(): void {
        try {
            if (this.gameChannel) {
                this.gameChannel.leave()
                this.gameChannel = null
            }
            console.log('👋 Game Channel desconectado', 'info')
        } catch (error) {
            console.log(`❌ Error: ${error}`, 'error')
        }
    }
}

// (Aquí iría 'handleSendMessage' para el chat )
export const gameController = GameController.getInstance()
