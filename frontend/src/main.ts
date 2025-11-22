import './style.css'
//import type { ISlideData } from './interfaces/carousel'
//import { Carousel } from './components/howToPlayCarousel/howToPlayCarousel'
import AccessContainer from './components/accessContainer/AccessContainer'

import { JoinGameModal } from './components/joinGameModal/JoinGameModal'
import { login } from './providers/userProvider'

// Import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
// import { renderWaitingRoom } from './components/waitingRoom/waiting-room.ts'

// import { renderUserForm } from './components/userForm/userForm.ts'
//import { renderWaitingRoom } from './components/waitingRoom/waiting-room'
// Nuevo: importar el formulario de usuario (ajusta la ruta si es distinta)
// import { renderUserForm } from './components/userForm/userForm'

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 */
// src/app.ts
// Import  {renderUserForm} from './components/userForm/userForm.ts';

// 1. Buscamos el "Escenario" (el <div id="app"> del index.html)
const appContainer = document.getElementById('app')!

// 2. Comprobamos si el escenario existe
if (appContainer) {
    // 3. Llamamos al componente de Sala de Espera para que se pinte
    // (Simulamos que queremos cargar la partida con ID "1")
    // renderWaitingRoom(appContainer, '1')

    // (Lógica anterior de userForm)
    // renderUserForm(appContainer);

    try {
        login('user@example.com', 'password')
        const modal = new JoinGameModal(appContainer, () => {
            console.log('El usuario canceló o cerró el modal')
            // Aquí podrías recargar el menú principal si fuera necesario
        })
        modal.render()

        // const accessContainer = new AccessContainer(appContainer)
        // accessContainer.render()
    } catch (error) {
        console.error('Hubo un problema mu gordo', error)
    }
} else {
    // Console.error(
    //     'Error Fatal: No se encontró el contenedor #app en el index.html'
    // )
    //renderWaitingRoom(appContainer, '1') // ⬅️ Comentado para la prueba
    //renderUserForm(appContainer) // ⬅️ Render del UserForm
}
