import './style.css'
import { renderWaitingRoom } from './components/waitingRoom/waiting-room'
// Nuevo: importar el formulario de usuario (ajusta la ruta si es distinta)
import { renderUserForm } from './components/userForm/userForm'

const appContainer = document.querySelector('#app') as HTMLDivElement

if (appContainer) {
    renderWaitingRoom(appContainer, '1') // ⬅️ Comentado para la prueba
    //renderUserForm(appContainer) // ⬅️ Render del UserForm
}