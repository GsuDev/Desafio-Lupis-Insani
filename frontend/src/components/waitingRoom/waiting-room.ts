// 1. Importar modelos y el *Controlador*
import { ParticipantList } from '../participantList/participantList'
import { gameController } from '../../controllers/GameController.ts'
import { participantController } from '../../controllers/ParticipantController'
import { WaitingRoomChat } from '../waitingRoomChat/waitingRoomChat.ts'
import { GameComponent } from '../game/game.ts'


// 2. Importar el CSS
import './waiting-room.css'
import type { Game, Message } from '../../models/models.ts'
import { emitGameEvent } from '../../providers/event.provider.ts'
import { userController } from '../../controllers/UserController.ts'

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

    let isGameActive = false;
    let gameComponent: GameComponent | null = null;

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

    const renderGameDetails = (gameOrId: any) => {
        const game = gameController.currentGame
        if (!game) {
            return
        }

        // SI LA PARTIDA YA NO ESTÁ EN ESPERA, CAMBIAR VISTA
        const isGameStarted = game.state !== 'waiting' && game.state !== 'finished';

        if (isGameStarted) {
            // A) Si el juego ha empezado y aún no hemos cambiado la vista:
            if (!isGameActive) {
                console.log('🚀 La partida ha comenzado. Cambiando vista...');

                // 1. Limpiar el contenedor (borra la Waiting Room)
                container.innerHTML = '';

                // 2. Instanciar y renderizar el componente de Juego
                gameComponent = new GameComponent();
                container.appendChild(gameComponent.render());

                // 3. Marcar como activo para no recrearlo en cada update
                isGameActive = true;
            }

            // B) Actualizar los datos del componente de juego
            if (gameComponent) {
                // Asumiendo que tu GameComponent tiene un método update(game, participants)
                gameComponent.update(game, game.participants || []);
            }

            // Salimos para no ejecutar lógica de la Waiting Room
            return;
        }

        // --- LÓGICA DE WAITING ROOM (Si la partida NO ha empezado) ---
        if (game.state == 'waiting') {
            // Si por alguna razón volvemos a estado 'waiting' y estábamos en juego (reset)
            if (isGameActive) {
                isGameActive = false;
                // Aquí podrías recargar la página o volver a llamar a renderWaitingRoom
                window.location.reload();
                return;
            }

            // Actualiza la lista de participantes de la sala de espera
            const participants = game.participants || []
            participantList.updateParticipants(participants)
            participantList.disableButton(!participantController.isHost())

            // Conectar canal si no está conectado
            // (Nota: es mejor mover esto al controller o hacerlo solo una vez)
            if (!gameController['gameChannel']) {
                gameController.connectGameChannel(gameId);
            }
        }

    }
    await renderGameDetails(gameId)

    // 5. Conectar la Vista con el Controlador
    gameController.init(
        showLoading,
        showGlobalError,
        renderGameDetails,
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
