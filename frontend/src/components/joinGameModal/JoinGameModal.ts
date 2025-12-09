import './JoinGameModal.css'

import { gameController } from '../../controllers/GameController'
import { renderWaitingRoom } from '../waitingRoom/waiting-room'
import type { GameData } from '../../models/models'

export class JoinGameModal {
    private container: HTMLElement
    private onClose: () => void
    private publicGamesContainer: HTMLElement | null = null
    private refreshInterval: number | null = null

    constructor(container: HTMLElement, onClose: () => void) {
        this.container = container
        this.onClose = onClose
    }

    async render(): Promise<void> {
        const container = this.container

        // Para crear el overlay translúcido
        const root = document.createElement('div')
        root.classList.add('join-game-modal-overlay')

        // Contenedor para el modal
        const modalBox = document.createElement('div')
        modalBox.classList.add('join-game-modal-box')

        // ELEMENTOS DEL MODAL

        // Header
        const header = document.createElement('div')
        header.classList.add('modal-header')

        const title = document.createElement('h2')
        title.textContent = 'Unirse a sala'
        header.appendChild(title)

        // Sección de código privado
        const privateSection = document.createElement('section')
        privateSection.className = 'modal-private-section'

        const privateLabel = document.createElement('label')
        privateLabel.textContent = '🔒 Código de sala privada'
        privateLabel.className = 'section-label'

        const input = document.createElement('input')
        input.type = 'text'
        input.placeholder = 'Ingresa el código de la sala'
        input.className = 'modal-input'
        input.id = 'game-id-input'

        privateSection.appendChild(privateLabel)
        privateSection.appendChild(input)

        // Área de feedback de errores
        const errorMsg = document.createElement('p')
        errorMsg.className = 'error-msg'
        errorMsg.style.display = 'none'
        errorMsg.id = 'join-error-msg'

        // Sección de partidas públicas
        const publicSection = document.createElement('section')
        publicSection.className = 'modal-public-section'

        const publicLabel = document.createElement('label')
        publicLabel.textContent = '🌐 Partidas públicas disponibles'
        publicLabel.className = 'section-label'

        const gamesContainer = document.createElement('div')
        gamesContainer.className = 'public-games-container'
        gamesContainer.id = 'public-games-list'
        this.publicGamesContainer = gamesContainer

        const loadingMsg = document.createElement('p')
        loadingMsg.className = 'loading-msg'
        loadingMsg.textContent = 'Cargando partidas...'
        gamesContainer.appendChild(loadingMsg)

        publicSection.appendChild(publicLabel)
        publicSection.appendChild(gamesContainer)

        // Footer (los botones)
        const actions = document.createElement('div')
        actions.className = 'modal-actions'

        const btnCancel = document.createElement('button')
        btnCancel.className = 'btn btn-cancel'
        btnCancel.textContent = 'Cancelar'
        btnCancel.onclick = () => this.handleCancel(root)

        const btnJoin = document.createElement('button')
        btnJoin.className = 'btn btn-join'
        btnJoin.textContent = 'Ir con código'
        btnJoin.onclick = () =>
            this.handleJoinWithCode(Number(input.value), errorMsg, root)

        actions.appendChild(btnCancel)
        actions.appendChild(btnJoin)

        // Ensamblado
        modalBox.appendChild(header)
        modalBox.appendChild(privateSection)
        modalBox.appendChild(errorMsg)
        modalBox.appendChild(publicSection)
        modalBox.appendChild(actions)

        root.appendChild(modalBox)
        container.appendChild(root)

        // Cargar partidas públicas
        await this.loadPublicGames()

        // Refresh automático cada 5 segundos
        this.refreshInterval = window.setInterval(() => {
            this.loadPublicGames()
        }, 5000)
    }

    private async loadPublicGames(): Promise<void> {
        if (!this.publicGamesContainer) return

        try {
            const publicGames = await gameController.getPublicGames()

            if (publicGames.length === 0) {
                this.publicGamesContainer.innerHTML = `
                    <p class="no-games-msg">
                        No hay partidas públicas disponibles
                    </p>
                `
                return
            }
            // Obtener IDs actuales en el DOM
            const existingCards = Array.from(
                this.publicGamesContainer.querySelectorAll('.game-card')
            )

            const existingIds = new Set(
                existingCards.map((card) =>
                    parseInt(card.getAttribute('data-game-id') || '0')
                )
            )

            // IDs de las partidas nuevas
            const newGameIds = new Set(publicGames.map((g) => g.id))

            // 1. Eliminar cards que ya no existen
            existingCards.forEach((card) => {
                const gameId = parseInt(
                    card.getAttribute('data-game-id') || '0'
                )
                if (!newGameIds.has(gameId)) {
                    card.remove()
                }
            })

            // 2. Actualizar o crear cards
            for (const game of publicGames) {
                const existingCard = this.publicGamesContainer.querySelector(
                    `[data-game-id="${game.id}"]`
                )

                if (existingCard) {
                    // Actualizar card existente (solo contador)
                    await this.updateGameCard(existingCard as HTMLElement, game)
                } else {
                    // Crear nueva card
                    const card = await this.createGameCard(game)
                    this.publicGamesContainer.appendChild(card)
                }
            }
        } catch (error) {
            console.error('❌ Error cargando partidas públicas:', error)
            if (this.publicGamesContainer) {
                this.publicGamesContainer.innerHTML = `
                    <p class="error-games-msg">
                        Error al cargar partidas
                    </p>
                `
            }
        } finally {
            // Eliminar mensaje de carga si existe
            const loadingMsg =
                this.publicGamesContainer.querySelector('.loading-msg')
            if (loadingMsg) {
                loadingMsg.remove()
            }
        }
    }

    private async updateGameCard(
        cardElement: HTMLElement,
        game: GameData
    ): Promise<void> {
        // Solo actualizar el contador de jugadores
        const participants = await gameController.getGameParticipants(game.id)
        const participantCount = participants.length

        const playerCountElement = cardElement.querySelector('.player-count')
        if (playerCountElement) {
            playerCountElement.innerHTML = `👥 <strong>${participantCount}/28</strong>`
        }
    }

    private async createGameCard(game: GameData): Promise<HTMLElement> {
        const card = document.createElement('div')
        card.className = 'game-card'
        card.setAttribute('data-game-id', game.id.toString())

        // Info de la partida
        const info = document.createElement('div')
        info.className = 'game-info'

        const gameId = document.createElement('span')
        gameId.className = 'game-id'
        gameId.textContent = `ID: ${game.id}`

        // Obtener participantes
        const participants = await gameController.getGameParticipants(game.id)
        const participantCount = participants.length

        const playerCount = document.createElement('span')
        playerCount.className = 'player-count'
        playerCount.innerHTML = `👥 <strong>${participantCount}/28</strong>`

        info.appendChild(gameId)
        info.appendChild(playerCount)

        // Botón de unirse
        const joinBtn = document.createElement('button')
        joinBtn.className = 'btn-join-game'
        joinBtn.textContent = 'UNIRSE'
        joinBtn.onclick = async () => {
            await this.handleJoinGame(game.id, card)
        }

        card.appendChild(info)
        card.appendChild(joinBtn)

        return card
    }

    private async handleJoinGame(
        gameId: number,
        cardElement: HTMLElement
    ): Promise<void> {
        try {
            // Deshabilitar botón mientras se procesa
            const btn = cardElement.querySelector(
                '.btn-join-game'
            ) as HTMLButtonElement
            if (btn) {
                btn.disabled = true
                btn.textContent = 'UNIENDO...'
            }

            const gameData = await gameController.handleJoin(gameId)

            if (gameData) {
                gameController.setGameData(gameData)
            }

            const app = document.getElementById('app')
            if (!app) {
                throw new Error('Imposible renderizar')
            }

            // Limpiar interval antes de cambiar vista
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval)
            }

            renderWaitingRoom(app, gameId)
        } catch (error: any) {
            console.error('❌ Error uniéndose a partida:', error)
            alert(`Error: ${error.message}`)

            // Rehabilitar botón
            const btn = cardElement.querySelector(
                '.btn-join-game'
            ) as HTMLButtonElement
            if (btn) {
                btn.disabled = false
                btn.textContent = 'UNIRSE'
            }
        }
    }

    private handleCancel(rootElement: HTMLElement): void {
        // Limpiar interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval)
        }
        rootElement.remove()
    }

    private async handleJoinWithCode(
        gameId: number,
        errorElement: HTMLElement,
        rootElement: HTMLElement
    ): Promise<void> {
        if (!gameId) {
            this.showError(errorElement, 'Por favor ingresa un código')
            return
        }

        try {
            errorElement.style.display = 'none'

            const gameData = await gameController.handleJoin(gameId)

            if (gameData) {
                gameController.setGameData(gameData)
            }

            const app = document.getElementById('app')
            if (!app) {
                throw new Error('Imposible renderizar')
            }

            // Limpiar interval antes de cambiar vista
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval)
            }

            renderWaitingRoom(app, gameId)
            this.handleCancel(rootElement)
        } catch (error: any) {
            this.showError(errorElement, error.message)
        }
    }

    private showError(errorElement: HTMLElement, message: string): void {
        errorElement.textContent = message
        errorElement.style.display = 'block'
        errorElement.style.color = 'red'
    }
}

export default JoinGameModal
