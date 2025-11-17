import type { ISlideData } from './interfaces/carousel'
import {Carousel} from './components/howToPlayCarousel/howToPlayCarousel'

import './style.css'
// Import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
// import { renderWaitingRoom } from './components/waitingRoom/waiting-room.ts'
// import { renderUserForm } from './components/userForm/userForm.ts'


const datosSlides: ISlideData[] =[
    {
        stepNumber:1,
        tittle:"LOBO",
        description:"LOBEA",
        imageUrl: "https://www.dadocritico.es/2534-medium_default/el-pacto-de-los-hombres-lobo-de-castronegro.jpg"
    },
    {
        stepNumber:2,
        tittle:"ALDEANO",
        description:"ALDEANEA",
        imageUrl: "https://tse3.mm.bing.net/th/id/OIP.9r7sXqg4h24URsL_UoHiBwAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"
    },
    {
        stepNumber:3,
        tittle:"ASESINO",
        description:"ASESINA",
        imageUrl: "https://th.bing.com/th/id/R.0464bb17cbdbf68ba78b40d9752f7b75?rik=KJCJAOL1zVTMIg&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f2%2fe%2fb%2f1519627-cool-ezio-auditore-wallpaper-2560x1440-for-windows.jpg&ehk=zGwr85bZW30vVLwJ4vp5f5Vimq4jBOZLlVhAmXMN5Dw%3d&risl=&pid=ImgRaw&r=0"
    
    }
]

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 */
// src/app.ts
// Import  {renderUserForm} from './components/userForm/userForm.ts';

// 1. Buscamos el "Escenario" (el <div id="app"> del index.html)
const appContainer = document.querySelector('#app')!

// 2. Comprobamos si el escenario existe
if (appContainer) {
    // 3. Llamamos al componente de Sala de Espera para que se pinte
    // (Simulamos que queremos cargar la partida con ID "1")
    // renderWaitingRoom(appContainer, '1')

    // (Lógica anterior de userForm)
    // renderUserForm(appContainer);

    try{
        const mainCarousel = new Carousel("app",datosSlides,0);
    } catch (error){
        console.error("Hubo un problema mu gordo",error);
    }

} else {
    // Console.error(
    //     'Error Fatal: No se encontró el contenedor #app en el index.html'
    // )
}
