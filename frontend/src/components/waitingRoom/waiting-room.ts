// 1. Importar modelos y el *Controlador*
import type { Game, Player } from '../../interfaces/game.models'
import {
    initGameController,
    handleLoadGame,
    handleStartGame,
} from '../../controllers/game-controller.ts'
// 2. Importar el CSS
import './waiting-room.css'

// --------------------------------------------------
// Funciones "Constructoras" de HTML
//
// --------------------------------------------------

/**
 * Crea la columna izquierda (Jugadores)
 */
const createPlayersColumn = (): [
    HTMLElement,
    (game: Game) => void,
    (isDisabled: boolean) => void,
] => {
    const aside = document.createElement('aside')
    aside.className = 'wr-players'

    // Header
    const header = document.createElement('header')
    header.className = 'wr-players-header'
    header.id = 'player-count-header'
    header.textContent = 'Cargando...'

    // Lista
    const ul = document.createElement('ul')
    ul.className = 'wr-players-list'
    ul.id = 'player-list'

    // Footer
    const footer = document.createElement('footer')
    footer.className = 'wr-players-footer'

    const startButton = document.createElement('button')
    startButton.className = 'start-button'
    startButton.id = 'start-game-button'
    startButton.textContent = 'Iniciar'
    startButton.disabled = true // Deshabilitado hasta que cargue

    footer.append(startButton)
    aside.append(header)
    aside.append(ul)
    aside.append(footer)

    // Definimos la función de "callback" que actualizará esta columna
    const updatePlayersColumn = (game: Game) => {
        header.innerHTML = `<span>${game.players.length}/30</span> Jugadores`

        // Genera el HTML de la lista
        ul.innerHTML = game.players
            .map((player) => `<li class="player-item">${player.name}</li>`)
            .join('')
    }

    // Callback para habilitar/deshabilitar el botón
    const disableButton = (isDisabled: boolean) => {
        startButton.disabled = isDisabled
        startButton.textContent = isDisabled ? 'Cargando...' : 'Iniciar'
    }

    // Devolvemos el elemento HTML y la función para actualizarlo
    return [aside, updatePlayersColumn, disableButton]
}

/**
 * Crea la columna derecha (Chat)
 */
const createChatColumn = (): HTMLElement => {
    const section = document.createElement('section')
    section.className = 'wr-chat-area'

    const header = document.createElement('header')
    header.className = 'wr-chat-header'
    header.textContent = 'General prepartida'

    const placeholder = document.createElement('div')
    placeholder.className = 'wr-chat-placeholder'
    placeholder.id = 'chat-placeholder'
    placeholder.innerHTML = `<p>Chat (No implementado)</p><i>Aquí se cargarían los mensajes...</i>`

    section.append(header)
    section.append(placeholder)
    return section
}

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
    const [playersColumn, updatePlayersView, disableStartButton] =
        createPlayersColumn()
    const chatColumn = createChatColumn()

    main.append(playersColumn)
    main.append(chatColumn)

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
        // Llama al callback específico de la columna de jugadores
        updatePlayersView(game)
        // (Aquí se llamaría a 'updateChatView(game.messages)' en el futuro)
    }

    // 5. Conectar la Vista con el Controlador
    initGameController(
        showLoading,
        showGlobalError,
        renderGameDetails,
        disableStartButton
    )

    // 6. Añadir Listeners de la Vista
    const startButton = container.querySelector('#start-game-button')!
    if (startButton) {
        startButton.addEventListener('click', () => {
            // La vista solo le dice al controlador "han hecho clic"
            handleStartGame()
        })
    }

    // 7. Iniciar la carga de datos
    // La vista le dice al controlador "ok, estoy lista, carga los datos"
    void handleLoadGame(gameId)
}
