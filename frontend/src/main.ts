import './style.css'
//import type { ISlideData } from './interfaces/carousel'
//import { Carousel } from './components/howToPlayCarousel/howToPlayCarousel'
import AccessContainer from './components/accessContainer/AccessContainer'

import { JoinGameModal } from './components/joinGameModal/JoinGameModal'
import { userController } from './controllers/UserController'
import ChangePasswordModal from './components/changePasswordModal/changePasswordModal'
import { renderUserForm } from './components/userForm/userForm'
import UserSettingsComponent from './components/userSettings/userSettings'
import UserProfileContainer from './components/userProfileContainer/userProfileContainer'

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

// 1. Buscamos el "Escenario" (el <div id="app"> del index.html)
//const appContainer = document.getElementById('app')!

// 2. Comprobamos si el escenario existe
/*if (appContainer) {
    // 3. Llamamos al componente de Sala de Espera para que se pinte
    // (Simulamos que queremos cargar la partida con ID "1")
    // renderWaitingRoom(appContainer, '1')

    // (Lógica anterior de userForm)
     renderUserForm(appContainer);

    try {
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
    
}*/
document.addEventListener('DOMContentLoaded', async () => {
    const appContainer = document.querySelector<HTMLDivElement>('#app')

    if (appContainer) {
        console.log('🔌 Iniciando prueba de integración...')

        try {
            // meto esto aqui para no tener que cargar el componente de login.y poder probar si tiene permisos
            //con el token y eso
            await userController.login('sergio@sergio.com', 'aaaaaaaa')

            // 2. CARGAR DATOS REALES
            await userController.loadProfile()

            // 3. RENDERIZAR EL COMPONENTE
            //const settings = new UserSettingsComponent(appContainer);
            //settings.render();

            //const dashboard = new UserProfileContainer(appContainer);
            //dashboard.render();

            const changePassword = new ChangePasswordModal(appContainer)
            changePassword.render()
        } catch (error) {
            console.error('Falló la prueba:', error)
            appContainer.innerHTML = `<h2 style="color:white">Error: No se pudo conectar. Revisa la consola.</h2>`
        }
    }
})
