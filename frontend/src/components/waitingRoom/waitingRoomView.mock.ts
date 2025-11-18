import { renderWaitingRoom } from './waiting-room'

export const loadWaitingRoom = () => {
    const app = document.getElementById('app')
    renderWaitingRoom(app, 1)
}
