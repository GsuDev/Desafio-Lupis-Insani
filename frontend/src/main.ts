import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import { renderWaitingRoom } from './components/waitingRoom/waitingRoom';


/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 */

// 1. Buscamos el "Escenario" (el <div id="app"> del index.html)
const appContainer = document.querySelector('#app') as HTMLDivElement;

// 2. Comprobamos si el escenario existe
if (appContainer) {
    // 3. Llamamos al componente de Sala de Espera para que se pinte
    // (Simulamos que queremos cargar la partida con ID "1")
    renderWaitingRoom(appContainer, "1");
    
    // (Lógica anterior de userForm)
    // renderUserForm(appContainer);
} else {
    console.error('Error Fatal: No se encontró el contenedor #app en el index.html');
}