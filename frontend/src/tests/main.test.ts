// import './style.css'
// //import type { ISlideData } from './interfaces/carousel'
// //import { Carousel } from './components/howToPlayCarousel/howToPlayCarousel'
// import AccessContainer from './components/accessContainer/AccessContainer'

// import { JoinGameModal } from './components/joinGameModal/JoinGameModal'
import { userController } from './controllers/UserController'
// import ChangePasswordModal from './components/changePasswordModal/changePasswordModal'
// import { renderUserForm } from './components/userForm/userForm'
// import UserSettingsComponent from './components/userSettings/userSettings'
// import UserProfileContainer from './components/userProfileContainer/userProfileContainer'

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
/*document.addEventListener('DOMContentLoaded', async () => {
    const appContainer = document.querySelector<HTMLDivElement>('#app')

    if (appContainer) {
        console.log('🔌 Iniciando prueba de integración...')

        try {
            // meto esto aqui para no tener que cargar el componente de login.y poder probar si tiene permisos
            //con el token y eso
            await userController.login('user@example.com', 'password')

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
})*/

//descomentar si se quiere probar el canal de lobos por consola
// import { WolvesChannel, type WolfEventData } from './channels/WolvesChannel';

// // la funcion que se ejecutara cuando el lobo reciba un evento
// const handleWolfEvent = (eventName: string, data: WolfEventData) => {
//     console.log(`🦊 [evento wolf recibido] - asunto: ${eventName}`, data);
// };

// async function authenticateAndConnect() {
//     console.log('1. usando usercontroller.login para autenticar...');

//     try {
//         // usamos la funcion de tu proyecto para hacer login
//         // la funcion debe devolver una promesa y manejar el token/cookie
//         const success = await userController.login('user@example.com', 'password');

//         if (success) {
//             console.log('✅ 2. login exitoso. sesion establecida.');

//             // si el login funciona, intentamos conectar al canal privado
//             console.log('3. intentando conectar al canal privado (partida 1)...');
//             new WolvesChannel(1, handleWolfEvent);
//         } else {
//             console.error('❌ 2. error: credenciales incorrectas o servidor caido.');
//         }

//     } catch (error) {
//         console.error('❌ error de red o servidor durante el login:', error);
//     }
// }

// authenticateAndConnect();

// Prueba de canal de partida con menú

// import {
//     GameChannel,
//     type GameEventData,
//     type GameEventHandler,
// } from './channels/GameChannel'

// const GAME_ID = 1
// let gameChannel: GameChannel | null = null

// // Handler para recibir eventos del canal
// const handleGameEvent: GameEventHandler = (
//     eventName: string,
//     data: GameEventData
// ) => {
//     const log = document.getElementById('log')!
//     const p = document.createElement('p')
//     p.textContent = `📩 Evento recibido: ${eventName} - ${JSON.stringify(data)}`
//     log.appendChild(p)
// }

// // Conectar al canal
// function connect() {
//     if (!gameChannel) {
//         gameChannel = new GameChannel(GAME_ID, handleGameEvent)
//         addLog(`🎮 Conectado al canal game.${GAME_ID}`)
//     } else {
//         addLog('⚠️ Ya estás conectado')
//     }
// }

// // Desconectar del canal
// function disconnect() {
//     if (gameChannel) {
//         gameChannel.leave()
//         gameChannel = null
//         addLog(`👋 Desconectado del canal game.${GAME_ID}`)
//     } else {
//         addLog('⚠️ No estás conectado')
//     }
// }

// // Enviar evento al backend
// async function sendEvent() {
//     const eventNameInput = document.getElementById(
//         'eventName'
//     ) as HTMLInputElement
//     const eventDataInput = document.getElementById(
//         'eventData'
//     ) as HTMLInputElement

//     const eventName = eventNameInput.value.trim()
//     let data: GameEventData = null

//     try {
//         data = eventDataInput.value ? JSON.parse(eventDataInput.value) : null
//     } catch {
//         addLog('❌ JSON inválido, se enviará null')
//     }

//     try {
//         const res = await fetch(`/api/games/${GAME_ID}/send`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ event: eventName, data: data }),
//         })
//         const json = await res.json()
//         addLog(`✅ Respuesta del servidor: ${JSON.stringify(json)}`)
//     } catch (e) {
//         addLog(`❌ Error enviando evento: ${e}`)
//     }
// }

// // Función auxiliar para añadir logs en la interfaz
// function addLog(message: string) {
//     const log = document.getElementById('log')!
//     const p = document.createElement('p')
//     p.textContent = message
//     log.appendChild(p)
//     log.scrollTop = log.scrollHeight
// }

// // --- Crear interfaz minimalista ---
// const container = document.createElement('div')
// container.style.padding = '1rem'
// container.style.fontFamily = 'sans-serif'

// const connectBtn = document.createElement('button')
// connectBtn.textContent = 'Conectar'
// connectBtn.onclick = connect

// const disconnectBtn = document.createElement('button')
// disconnectBtn.textContent = 'Desconectar'
// disconnectBtn.onclick = disconnect
// disconnectBtn.style.marginLeft = '1rem'

// const eventNameInput = document.createElement('input')
// eventNameInput.placeholder = 'Nombre del evento'
// eventNameInput.id = 'eventName'
// eventNameInput.style.marginLeft = '1rem'

// const eventDataInput = document.createElement('input')
// eventDataInput.placeholder = 'Datos JSON'
// eventDataInput.id = 'eventData'
// eventDataInput.style.marginLeft = '1rem'

// const sendBtn = document.createElement('button')
// sendBtn.textContent = 'Enviar evento'
// sendBtn.onclick = sendEvent
// sendBtn.style.marginLeft = '1rem'

// const logDiv = document.createElement('div')
// logDiv.id = 'log'
// logDiv.style.marginTop = '1rem'
// logDiv.style.height = '300px'
// logDiv.style.overflowY = 'auto'
// logDiv.style.border = '1px solid #ccc'
// logDiv.style.padding = '0.5rem'
// logDiv.style.background = '#f9f9f9'

// container.appendChild(connectBtn)
// container.appendChild(disconnectBtn)
// container.appendChild(eventNameInput)
// container.appendChild(eventDataInput)
// container.appendChild(sendBtn)
// container.appendChild(logDiv)

// document.body.appendChild(container)

// Prueba de canal de lobos con menú

// import {
//     WolvesChannel,
//     type WolfEventData,
//     type WolfEventHandler,
// } from './channels/WolvesChannel'

// const GAME_ID = 1
// let wolvesChannel: WolvesChannel | null = null

// // Handler para recibir eventos del canal privado
// const handleWolfEvent: WolfEventHandler = (
//     eventName: string,
//     data: WolfEventData
// ) => {
//     const log = document.getElementById('log')!
//     const p = document.createElement('p')
//     p.textContent = `🐺 Evento recibido: ${eventName} - ${JSON.stringify(data)}`
//     log.appendChild(p)
// }

// // Conectar al canal privado
// function connect() {
//     if (!wolvesChannel) {
//         wolvesChannel = new WolvesChannel(GAME_ID, handleWolfEvent)
//         addLog(`🎮 Conectado al canal privado wolves.${GAME_ID}`)
//     } else {
//         addLog('⚠️ Ya estás conectado')
//     }
// }

// // Desconectar del canal privado
// function disconnect() {
//     if (wolvesChannel) {
//         wolvesChannel.leave()
//         wolvesChannel = null
//         addLog(`👋 Desconectado del canal privado wolves.${GAME_ID}`)
//     } else {
//         addLog('⚠️ No estás conectado')
//     }
// }

// // Enviar evento al backend (misma ruta que antes, pero el backend filtrará por participantes)
// async function sendEvent() {
//     const eventNameInput = document.getElementById(
//         'eventName'
//     ) as HTMLInputElement
//     const eventDataInput = document.getElementById(
//         'eventData'
//     ) as HTMLInputElement

//     const eventName = eventNameInput.value.trim()
//     let data: WolfEventData = null

//     try {
//         data = eventDataInput.value ? JSON.parse(eventDataInput.value) : null
//     } catch {
//         addLog('❌ JSON inválido, se enviará null')
//     }

//     try {
//         const res = await fetch(`/api/games/${GAME_ID}/wolves/send`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer ' + localStorage.getItem('token'),
//             },
//             credentials: 'include', // importante para cookies/Sanctum
//             body: JSON.stringify({ event: eventName, data: data }),
//         })
//         const json = await res.json()
//         addLog(`✅ Respuesta del servidor: ${JSON.stringify(json)}`)
//     } catch (e) {
//         addLog(`❌ Error enviando evento: ${e}`)
//     }
// }

// // Función auxiliar para añadir logs en la interfaz
// function addLog(message: string) {
//     const log = document.getElementById('log')!
//     const p = document.createElement('p')
//     p.textContent = message
//     log.appendChild(p)
//     log.scrollTop = log.scrollHeight
// }

// // --- Crear interfaz minimalista ---
// const container = document.createElement('div')
// container.style.padding = '1rem'
// container.style.fontFamily = 'sans-serif'

// const connectBtn = document.createElement('button')
// connectBtn.textContent = 'Conectar'
// connectBtn.onclick = connect

// const disconnectBtn = document.createElement('button')
// disconnectBtn.textContent = 'Desconectar'
// disconnectBtn.onclick = disconnect
// disconnectBtn.style.marginLeft = '1rem'

// const eventNameInput = document.createElement('input')
// eventNameInput.placeholder = 'Nombre del evento'
// eventNameInput.id = 'eventName'
// eventNameInput.style.marginLeft = '1rem'

// const eventDataInput = document.createElement('input')
// eventDataInput.placeholder = 'Datos JSON'
// eventDataInput.id = 'eventData'
// eventDataInput.style.marginLeft = '1rem'

// const sendBtn = document.createElement('button')
// sendBtn.textContent = 'Enviar evento'
// sendBtn.onclick = sendEvent
// sendBtn.style.marginLeft = '1rem'

// const logDiv = document.createElement('div')
// logDiv.id = 'log'
// logDiv.style.marginTop = '1rem'
// logDiv.style.height = '300px'
// logDiv.style.overflowY = 'auto'
// logDiv.style.border = '1px solid #ccc'
// logDiv.style.padding = '0.5rem'
// logDiv.style.background = '#f9f9f9'

// container.appendChild(connectBtn)
// container.appendChild(disconnectBtn)
// container.appendChild(eventNameInput)
// container.appendChild(eventDataInput)
// container.appendChild(sendBtn)
// container.appendChild(logDiv)

// document.body.appendChild(container)
