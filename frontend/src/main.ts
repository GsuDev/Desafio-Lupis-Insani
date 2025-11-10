// src/app.ts
import  {renderUserForm} from './components/userForm/userForm.ts';

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 */

// 1. Buscamos el "Escenario" (el <div id="app"> del index.html)
const appContainer = document.querySelector('#app') as HTMLDivElement;

// 2. Comprobamos si el escenario existe
if (appContainer) {
    // 3. Llamamos al componente de registro para que se pinte dentro del escenario
    // (En el futuro, aquí habrá un Router que decida qué pintar)
    renderUserForm(appContainer);
} else {
    console.error('Error Fatal: No se encontró el contenedor #app en el index.html');
}
