import { ParticipantList } from '../participantList/participantList'
import { gameController } from '../../controllers/GameController.ts'
import { participantController } from '../../controllers/ParticipantController'
import { WaitingRoomChat } from '../waitingRoomChat/waitingRoomChat.ts'
import { GameComponent } from '../game/game.ts'

import './waiting-room.css'
import type { Game, Message } from '../../models/models.ts'
import { emitGameEvent } from '../../providers/event.provider.ts'
import { userController } from '../../controllers/UserController.ts'
import UserProfileComponent from '../userProfile/userProfile.ts'
import AccessContainer from '../accessContainer/AccessContainer.ts'
import UserProfileContainer from '../userProfileContainer/userProfileContainer.ts'
import { togglePublic } from '../../providers/game.provider.ts'

/**
 * Función principal de Renderizado
 */
export const renderWaitingRoom = async (
    container: HTMLElement,
    gameId: number
) => {
    // 1. Limpiar el contenedor
    container.innerHTML = ''

    let isGameActive = false
    let gameComponent: GameComponent | null = null

    // 2. Crear el esqueleto de la UI
    const roomContainer = document.createElement('div')
    roomContainer.className = 'waiting-room-container'

    // Header
    const header = document.createElement('header')
    header.className = 'wr-header'

    // Botón de salir
    const exitBtn = document.createElement('button')
    exitBtn.className = 'wr-exit-btn'
    exitBtn.textContent = 'SALIR'

    exitBtn.onclick = async () => {
        // Emitir evento player.left antes de salir
        const currentGame = gameController.currentGame
        if (currentGame?.id) {
            try {
                await emitGameEvent(currentGame.id, 'player.left', {
                    gameId: currentGame.id,
                    userId: userController.currentUser?.id,
                })
                console.log('📤 Evento player.left emitido')
            } catch (error) {
                console.error('❌ Error al emitir player.left:', error)
            }
        }

        // Desconectar canales
        gameController.disconnectGameChannel()
        gameController.disconnectWolvesChannel()

        // Navegar al perfil o acceso
        const user = userController.currentUser
        container.innerHTML = ''

        if (user && user.email) {
            const profile = new UserProfileContainer(container)
            profile.render()
        } else {
            const access = new AccessContainer(container)
            access.render()
        }
    }

    const titleContainer = document.createElement('div')
    titleContainer.className = 'wr-title-container'

    const title = document.createElement('h1')
    title.textContent = 'LOBBY DE PARTIDA Nº: ' + gameId

    // Indicador público/privado
    const visibilityBadge = document.createElement('span')
    visibilityBadge.className = 'wr-visibility-badge'
    visibilityBadge.id = 'visibility-badge'
    visibilityBadge.textContent = '🌐 PÚBLICA'

    titleContainer.append(title, visibilityBadge)

    // Toggle button (solo para host)
    const toggleBtn = document.createElement('button')
    toggleBtn.className = 'wr-toggle-btn'
    toggleBtn.id = 'toggle-public-btn'
    toggleBtn.textContent = '🔒 Cambiar Visibilidad'
    toggleBtn.style.display = 'none' // Oculto por defecto

    toggleBtn.onclick = async () => {
        // Guardar el estado actual para poder revertir
        const currentGame = gameController.currentGame
        if (!currentGame) {
            console.error('❌ No hay partida actual')
            return
        }

        const previousState = currentGame.isPublic
        const newState = !previousState

        try {
            // 🚀 UPDATE OPTIMISTA: Cambiar inmediatamente la UI
            toggleBtn.disabled = true
            updateVisibilityUI(newState)
            console.log('⚡ Update optimista: isPublic =', newState)

            // Llamar al backend
            const response = await togglePublic(gameId)

            if (response.success && response.data) {
                // ✅ Éxito: verificar que coincida con lo esperado
                const serverState = response.data.isPublic
                if (serverState !== newState) {
                    console.warn(
                        '⚠️ Estado del servidor difiere del optimista, corrigiendo...'
                    )
                    updateVisibilityUI(serverState)
                }
                console.log(
                    '✅ Visibilidad cambiada correctamente:',
                    serverState
                )
            } else {
                // ❌ Error: revertir al estado anterior
                console.error('❌ Error del servidor:', response.message)
                updateVisibilityUI(previousState)
                window.alert(
                    'Error al cambiar visibilidad: ' + response.message
                )
            }
        } catch (error) {
            // ❌ Error de red: revertir al estado anterior
            console.error('❌ Error en toggle:', error)
            updateVisibilityUI(previousState)
            window.alert('Error de conexión al cambiar visibilidad')
        } finally {
            toggleBtn.disabled = false
        }
    }

    header.append(exitBtn, titleContainer, toggleBtn)

    // Contenido principal
    const main = document.createElement('main')
    main.className = 'wr-main'

    // 3. Crear columnas usando las funciones helpers
    const participantList = new ParticipantList()
    const participantsColumn = participantList.render()

    const chatContainerColumn = document.createElement('div')
    chatContainerColumn.className = 'wr-chat-column-container'

    const chatComponent = new WaitingRoomChat(
        chatContainerColumn,
        [],
        (txt: string) => {
            emitGameEvent(gameId, 'chat.message', {
                gameId,
                message: txt,
                userId: userController.currentUser?.id,
            })
        }
    )

    chatComponent.render()

    main.append(participantsColumn)
    main.append(chatContainerColumn)

    roomContainer.append(header)
    roomContainer.append(main)

    container.append(roomContainer)

    const showLoading = (isLoading: boolean) => {
        participantList.setLoading(isLoading)
    }

    const showGlobalError = (message: string) => {
        if (message) {
            window.alert(`Error: ${message}`)
        }
    }

    const updateVisibilityUI = (isPublic: boolean | undefined) => {
        const badge = document.getElementById('visibility-badge')
        if (!badge) return

        if (isPublic === undefined || isPublic === null) {
            badge.textContent = '❓ DESCONOCIDA'
            badge.className = 'wr-visibility-badge unknown'
            return
        }

        if (isPublic) {
            badge.textContent = '🌐 PÚBLICA'
            badge.className = 'wr-visibility-badge public'
        } else {
            badge.textContent = '🔒 PRIVADA'
            badge.className = 'wr-visibility-badge private'
        }
    }

    const renderGameDetails = (gameData: any) => {
        const game = gameData

        console.log('renderGameDetails recibió:', game)

        if (!game || game === undefined) {
            return
        }

        // Actualizar indicador de visibilidad (solo si no estamos en medio de un toggle)
        const toggleButton = document.getElementById(
            'toggle-public-btn'
        ) as HTMLButtonElement | null
        const isTogglingNow = toggleButton?.disabled ?? false

        if (!isTogglingNow) {
            // Solo actualizar si NO estamos haciendo toggle (para no pisar el update optimista)
            updateVisibilityUI(game.isPublic)
        }

        // Mostrar/ocultar toggle button según si es host
        if (toggleButton) {
            const isHost = participantController.isHost()
            toggleButton.style.display =
                isHost && game.state === 'waiting' ? 'block' : 'none'
        }

        // SI LA PARTIDA YA NO ESTÁ EN ESPERA, CAMBIAR VISTA
        const isGameStarted =
            game.state !== 'waiting' &&
            game.state !== 'finished' &&
            game.state !== undefined

        if (isGameStarted) {
            // A) Si el juego ha empezado y aún no hemos cambiado la vista:
            if (!isGameActive) {
                console.log('🚀 La partida ha comenzado. Cambiando vista...')

                // 1. Limpiar el contenedor (borra la Waiting Room)
                container.innerHTML = ''

                // 2. Instanciar y renderizar el componente de Juego
                gameComponent = new GameComponent()
                container.appendChild(gameComponent.render())

                // 3. Marcar como activo para no recrearlo en cada update
                isGameActive = true
            }

            // B) Actualizar los datos del componente de juego
            if (gameComponent) {
                gameComponent.update(game, game.participants || [])
            }

            if (!gameController['gameChannel']) {
                gameController.connectGameChannel(game.id)
            }

            // Salimos para no ejecutar lógica de la Waiting Room
            return
        }

        // --- LÓGICA DE WAITING ROOM (Si la partida NO ha empezado) ---
        if (game.state == 'waiting') {
            // Si por alguna razón volvemos a estado 'waiting' y estábamos en juego (reset)
            if (isGameActive) {
                isGameActive = false
                renderWaitingRoom(container, game.id)
                return
            }

            // Actualiza la lista de participantes de la sala de espera
            const participants = game.participants || []
            participantList.updateParticipants(participants)
            participantList.disableButton(!participantController.isHost())

            // Conectar canal si no está conectado
            if (!gameController['gameChannel']) {
                gameController.connectGameChannel(game.id)
            }
        }
    }

    // 5. Conectar la Vista con el Controlador
    gameController.init(
        showLoading,
        showGlobalError,
        renderGameDetails,
        (_isDisabled: boolean) => {
            // participantList.disableButton(!participantController.isHost())
        },
        (message: Message) => WaitingRoomChat.addMessage(message)
    )

    // 6. Añadir Listeners de la Vista
    const startButton = container.querySelector('#start-game-button')!
    if (startButton) {
        startButton.addEventListener('click', () => {
            gameController.handleStartGame()
        })
    }

    // 7. Iniciar la carga de datos
    void gameController.handleLoadGame(gameId)
}
