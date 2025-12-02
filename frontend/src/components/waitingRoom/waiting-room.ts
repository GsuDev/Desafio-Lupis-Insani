import { ParticipantList } from '../participantList/participantList'
import { gameController } from '../../controllers/GameController.ts'
import { participantController } from '../../controllers/ParticipantController'
import { WaitingRoomChat } from '../waitingRoomChat/waitingRoomChat.ts'

import './waiting-room.css'
import type { Game, Message } from '../../models/models.ts'
import { emitGameEvent } from '../../providers/event.provider.ts'
import { userController } from '../../controllers/UserController.ts'
import UserProfileComponent from '../userProfile/userProfile.ts'
import AccessContainer from '../accessContainer/AccessContainer.ts'
import UserProfileContainer from '../userProfileContainer/userProfileContainer.ts'

/**
 * Crea la columna derecha (Chat)
 */

// --------------------------------------------------
// Función principal de Renderizado
// --------------------------------------------------

export const renderWaitingRoom = async (
    container: HTMLElement,
    gameId: number
) => {
    // 1. Limpiar el contenedor
    container.innerHTML = ''

    // 2. Crear el esqueleto de la UI
    const roomContainer = document.createElement('div')
    roomContainer.className = 'waiting-room-container'

    // Header
    const header = document.createElement('header')
    header.className = 'wr-header'
    //boton de salir
    const exitBtn = document.createElement('button')
    exitBtn.className = 'wr-exit-btn'
    exitBtn.textContent = '<- SALIR'

    exitBtn.onclick = () => {
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

    const title = document.createElement('h1')
    title.textContent = 'LOBBY DE PARTIDA'

    header.append(exitBtn, title)

    // Contenedor de mensajes globales (error/loading)
    //const globalMessage = document.createElement('div')
    //globalMessage.className = 'global-message' // Estilos en CSS
    //globalMessage.id = 'global-message'
    //container.appendChild(globalMessage)

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
            emitGameEvent(1, 'chat.message', {
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
    //roomContainer.append(globalMessage)
    roomContainer.append(main)

    container.append(roomContainer)

    const showLoading = (isLoading: boolean) => {
        // En vez de mostrar un cartel, le decimos a la lista que cambie su botón
        participantList.setLoading(isLoading)
    }

    const showGlobalError = (message: string) => {
        if (message) {
            window.alert(`Error: ${message}`) // Temporal
        }
    }

    const renderGameDetails = (gameId: number) => {
        const game = gameController.currentGame
        if (!game) {
            return
        }
        // Actualiza la lista de participantes con los datos del juego
        const participants = game.participants || []
        // participants.forEach((p) => console.log(p))
        participantList.updateParticipants(participants)
        participantList.disableButton(!participantController.isHost())

        if (game.messages && game.messages.length > 0) {
            // chatComponent es la instancia que creamos antes
            // Ojo: Tendrás que exponer un método setMessages o iterar con addMessage
            console.log('📩', game.messages)
            //game.messages.forEach((msg) => WaitingRoomChat.addMessage(msg))
        }
        gameController.connectGameChannel(gameId)
    }
    await renderGameDetails(gameId)

    // 5. Conectar la Vista con el Controlador
    gameController.init(
        showLoading,
        showGlobalError,
        () => {},
        (_isDisabled: boolean) => {
            participantList.disableButton(!participantController.isHost())
        },
        (message: Message) => WaitingRoomChat.addMessage(message)
    )

    // 6. Añadir Listeners de la Vista
    const startButton = container.querySelector('#start-game-button')!
    if (startButton) {
        startButton.addEventListener('click', () => {
            // La vista solo le dice al controlador "han hecho clic"
            gameController.handleStartGame()
        })
    }

    // 7. Iniciar la carga de datos
    // La vista le dice al controlador "ok, estoy lista, carga los datos"
    void gameController.handleLoadGame(gameId)
}
