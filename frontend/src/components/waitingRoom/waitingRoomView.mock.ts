import { renderWaitingRoom } from './waiting-room'

export const loadWaitingRoom = () => {
    const app = document.getElementById('app')
    if (!app) {
        console.log('Fallo cargando la sala de espera')
        return
    }
    renderWaitingRoom(app, 1)
}
