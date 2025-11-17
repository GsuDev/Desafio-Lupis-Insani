import './style.css'
import { renderWaitingRoom } from './components/waitingRoom/waiting-room'

const appContainer = document.querySelector('#app') as HTMLDivElement

if (appContainer) {
    // Renderizamos la Waiting Room completa
    // Pasamos el gameId '1' que es el que tiene datos en el mock
    renderWaitingRoom(appContainer, '1')
}