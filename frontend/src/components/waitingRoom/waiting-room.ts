// 1. Importar modelos y el *Controlador*
import { ParticipantList } from '../participantList/participantList'
import type { Game } from '../../interfaces/game.models'
import { gameController } from '../../controllers/GameController.ts'
import { participantController } from '../../controllers/ParticipantController'
import { WaitingRoomChat } from '../waitingRoomChat/waitingRoomChat.ts'
import type { IMessageData } from '../../interfaces/game.models'

// 2. Importar el CSS
import './waiting-room.css'

/**
 * Crea la columna derecha (Chat)
 */

// --------------------------------------------------
// Función principal de Renderizado
// --------------------------------------------------

export const renderWaitingRoom = (
    container: HTMLDivElement,
    gameId: string
) => {
    // 1. Limpiar el contenedor
    container.innerHTML = ''

    // 2. Crear el esqueleto de la UI
    const roomContainer = document.createElement('div')
    roomContainer.className = 'waiting-room-container'

    // Header
    const header = document.createElement('header')
    header.className = 'wr-header'
    header.innerHTML = '<h1>Logo y Título</h1>'

    // Contenedor de mensajes globales (error/loading)
    const globalMessage = document.createElement('div')
    globalMessage.className = 'global-message' // Estilos en CSS
    globalMessage.id = 'global-message'

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
        (message) => {
            //callback de un usuario escribiendo
            console.log('Usuario quiere enviar esto: ', message)
            //aqui deberia de llamar a gameController para enviar el mensaje
            //lo dejo asi para ir solucionando fallos
        }
    )

    chatComponent.render()

    main.append(participantsColumn)
    main.append(chatContainerColumn)

    roomContainer.append(header)
    roomContainer.append(globalMessage)
    roomContainer.append(main)

    container.append(roomContainer)

    // 4. Definir los Callbacks que el Controlador usará
    // (Estas funciones SÍ tocan el DOM)
    //-----------
    const showLoading = (isLoading: boolean) => {
        if (isLoading) {
            globalMessage.textContent = 'Cargando datos de la partida...'

            globalMessage.className = 'global-message is-loading'
        } else {
            globalMessage.className = 'global-message'
        }
    }

    const showGlobalError = (message: string) => {
        if (message) {
            globalMessage.textContent = message
            globalMessage.className = 'global-message is-error'
        } else {
            globalMessage.className = 'global-message'
        }
    }

    const renderGameDetails = (game: Game) => {
        // Actualiza la lista de participantes con los datos del juego
        const participants = game.participants || []
        participantList.updateParticipants(participants)
        participantList.disableButton(!participantController.isHost())

        if (game.messages && game.messages.length > 0) {
            // chatComponent es la instancia que creamos antes
            // Ojo: Tendrás que exponer un método setMessages o iterar con addMessage

            game.messages.forEach((msg) => chatComponent.addMessage(msg))
        }
    }

    // 5. Conectar la Vista con el Controlador
    gameController.init(
        showLoading,
        showGlobalError,
        renderGameDetails,
        (_isDisabled: boolean) => {
            participantList.disableButton(!participantController.isHost())
        },
        (message: IMessageData) => chatComponent.addMessage(message)
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
