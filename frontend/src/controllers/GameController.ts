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
    getGames,
    deleteGame,
} from '../providers/game.provider'

class GameController {
    private static instance: GameController

    private gameChannel: GameChannel | null = null
    private wolvesChannel: WolvesChannel | null = null
    private _currentGame: Game | undefined

    // 1. Almacenamiento de Callbacks de la Vista
    private _showLoading: (isLoading: boolean) => void = () => {}
    private _showGlobalError: (message: string) => void = () => {}
    private _renderGameDetails: (game: Game) => void = () => {}
    private _disableStartButton: (isDisabled: boolean) => void = () => {}
    private _addChatMessage: (message: Message) => void = () => {}

    private constructor() {}

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
                localStorage.removeItem('currentGame')
            }
        }
    }

    /**
     * Recarga la partida actual desde la API y actualiza la UI
     * Útil para cuando llegan eventos del servidor (player.joined, player.left, etc.)
     */
    public async reloadCurrentGame(): Promise<void> {
        if (!this._currentGame?.id) {
            console.warn('⚠️ No hay partida actual para recargar')
            return
        }

        try {
            console.log('🔄 Recargando partida desde el servidor...')
            const response = await getGame(this._currentGame.id)

            if (!response.data?.game) {
                throw new Error('No se recibieron datos de la partida')
            }

            // Actualizar el estado local
            this._currentGame = response.data.game
            localStorage.setItem(
                'currentGame',
                JSON.stringify(this._currentGame)
            )

            // Notificar a la vista para que actualice
            if (this._renderGameDetails) {
                this._renderGameDetails(this._currentGame)
            }

            console.log('✅ Partida recargada correctamente')
        } catch (error: any) {
            console.error('❌ Error al recargar la partida:', error)
            this._showGlobalError(
                `Error al actualizar la partida: ${error.message}`
            )
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
        if (this._renderGameDetails) {
            this._renderGameDetails(game)
        }
    }

    /**
     * La Vista llama a este método cuando necesita cargar los datos.
     */
    public async handleLoadGame(gameId: number): Promise<void> {
        this._showLoading(true)
        this._showGlobalError('')
        this._disableStartButton(true)

        try {
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
            this._renderGameDetails(this._currentGame)
        } catch (error: any) {
            this._showGlobalError(
                `Error al cargar la partida: ${error.message}`
            )
        } finally {
            this._showLoading(false)
        }
    }

    /**
     * La Vista llama a este método cuando se pulsa "Iniciar"
     */
    public async handleStartGame(): Promise<void> {
        if (!this._currentGame) return

        this._disableStartButton(true)
        this._showLoading(true)

        try {
            const gameId = this._currentGame.id
            const MIN_PLAYERS = 1

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

            await this.handleLoadGame(gameId)

            console.log(
                '✅ Partida iniciada correctamente',
                gameController.currentGame
            )
        } catch (error: any) {
            console.error(error)
            this._showGlobalError(
                error.message || 'Error desconocido al iniciar'
            )
            this._disableStartButton(false)
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
        return response.data.game.id
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
            console.log(`✅ Wolves Channel conectado`, 'success')
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

    /**
     * Obtiene todas las partidas disponibles
     */
    async getGamesList(): Promise<any[]> {
        try {
            // Importa * as gameProvider arriba si no lo tienes, o usa gameProvider.getGames()
            const response = await getGames()

            if (response.success && response.data?.games) {
                return response.data.games
            }
            return []
        } catch (error) {
            console.error('Error cargando partidas:', error)
            return []
        }
    }

    /**
     * Elimina una partida
     */
    async deleteGame(gameId: number): Promise<boolean> {
        try {
            const response = await deleteGame(gameId)

            if (response.success) {
                console.log('✅ Partida eliminada:', gameId)
                return true
            } else {
                alert(response.message || 'No se pudo eliminar la partida')
                return false
            }
        } catch (error) {
            console.error('Error borrando partida:', error)
            return false
        }
    }

    /**
     * Crea una partida nueva (admin)
     * devuelve la partida creada o null si falla
     */
    async createGame(): Promise<Game | null> {
        try {
            const response = await createGameRequest()

            if (response.success && response.data?.game) {
                console.log('✅ Partida creada:', response.data.game)
                return response.data.game
            } else {
                alert(response.message || 'No se pudo crear la partida')
                return null
            }
        } catch (error) {
            console.error('Error creando partida:', error)
            return null
        }
    }
}

export const gameController = GameController.getInstance()
