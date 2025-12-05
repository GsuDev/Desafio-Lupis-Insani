/**
 * --- CONTROLADOR DEL JUEGO ---
 * * Esta clase maneja la lógica de negocio (estado, llamadas a la API)
 * para la Sala de Espera (WaitingRoom) y otras vistas relacionadas con el juego.
 */

import { GameChannel } from '../channels/GameChannel'
import { WolvesChannel } from '../channels/WolvesChannel'
import type { Game, Message } from '../models/models'
import {
    getGame,
    joinGameRequest,
    createGameRequest,
    startGame,
} from '../providers/game.provider'

// import { joinGameRequest } from '../providers/joinGame.provider'
// Importamos el provider REAL
//import { getGame } from '../providers/game.provider.mock' // MOCK con participants para probar

class GameController {
    private static instance: GameController

    private gameChannel: GameChannel | null = null
    private wolvesChannel: WolvesChannel | null = null
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
        this._currentGame = currentGame

        if (currentGame) {
            localStorage.setItem('currentGame', JSON.stringify(currentGame))
        } else {
            localStorage.removeItem('currentGame')
        }
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
            // Si no, llamamos a la API
            //console.log('Fetching datos desde API...')
            const response = await getGame(gameId)
            console.log('handleLoadGame tiene: ', response)
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
            const MIN_PLAYERS = 1 // Mínimo necesario según tus reglas

            // 1. Comprobar participantes y Generar Bots si es necesario
            // (Asumimos que participants ya está cargado en _currentGame)
            const currentPlayersCount = this._currentGame.participants.length
            if (currentPlayersCount < MIN_PLAYERS) {
                throw new Error(
                    'No hay participantes suficientes para iniciar la partida'
                )
            }

            let startResponse = await startGame(gameId)
            if (!startResponse.success || !startResponse.data) {
                throw new Error(
                    startResponse.message || 'Error al iniciar la partida'
                )
            }

            // Recarga el juego aquí para ver los bots antes de cambiar de fase
            await this.handleLoadGame(gameId)

            console.log(
                '✅ Partida iniciada correctamente',
                gameController.currentGame
            )

            // Si la respuesta no trae participantes, usamos los que ya teníamos en memoria
            // if (!updatedGame.participants || updatedGame.participants.length === 0) {
            //     console.log('🔄 Recuperando participantes actualizados desde la API...');

            //     // Llamamos a la nueva función
            //     const participantsRes = await getParticipants(gameId);

            //     if (participantsRes.success && participantsRes.data) {

            //         updatedGame.participants = participantsRes.data.participants;
            //     } else {
            //         // Si falla la petición, usamos los que teníamos en memoria
            //         console.warn('⚠️ No se pudieron cargar participantes nuevos. Usando caché.');
            //         updatedGame.participants = this._currentGame?.participants || [];
            //     }
            // }
            // 3. Actualizar el estado local

            // Aquí la vista (WaitingRoom) debería detectar el cambio de estado
            // en el callback _renderGameDetails y cambiar la pantalla al componente de Juego.
        } catch (error: any) {
            console.error(error)
            this._showGlobalError(
                error.message || 'Error desconocido al iniciar'
            )
            this._disableStartButton(false) // Reactivar botón si falló
        } finally {
            this._showLoading(false)
        }
    }
    public async handleCreateGame() {
        console.log('handleCreateGame en el GameController')
        const response = await createGameRequest()
        if (!response.data) {
            throw new Error('Error al crear la partida.')
        }
        const game = this.handleJoin(response.data.game.id)
        //TODO CONTROLAR ERROR
        return response.data.game.id
        //provider creategame -> mirar en back -> crea partida -> devolver contrato -> devolver game id
        //comprobacion de error
    }

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

    public connectWolvesChannel(gameId: number): void {
        try {
            this.wolvesChannel = new WolvesChannel(gameId)
            console.log(`✅ Game Channel conectado`, 'success')
        } catch (error) {
            console.log(`❌ Error: ${error}`, 'error')
        }
    }

    public disconnectWolvesChannel(): void {
        try {
            if (this.wolvesChannel) {
                this.wolvesChannel.leave()
                this.wolvesChannel = null
            }
            console.log('👋 Wolves Channel desconectado', 'info')
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
