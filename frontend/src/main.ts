/*import AccessContainer from './components/accessContainer/AccessContainer'
import UserProfileContainer from './components/userProfileContainer/userProfileContainer'
import { userController } from './controllers/UserController'
import bgVideo from './assets/background-animation.mp4'
import './style.css'

const app = document.getElementById('app')
const initBackground = () => {
    if (document.querySelector('.global-video-background')) return

    const video = document.createElement('video')
    video.src = bgVideo
    video.className = 'global-video-background'
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true

    const overlay = document.createElement('div')
    overlay.className = 'global-video-overlay'

    document.body.prepend(overlay)
    document.body.prepend(video)
}

if (app) {
    initBackground()
    if (userController.isLoggedIn) {
        const userProfileContainer = new UserProfileContainer(app)
        userProfileContainer.render()
    } else {
        const accessContainer = new AccessContainer(app)
        accessContainer.render()
    }
}*/

import AccessContainer from './components/accessContainer/AccessContainer'
import UserProfileContainer from './components/userProfileContainer/userProfileContainer'
import { ResetPasswordForm } from './components/resetPasswordForm/resetPasswordForm'

import { userController } from './controllers/UserController'
import bgVideo from './assets/background-animation.mp4'
import './style.css'

const app = document.getElementById('app')

const initBackground = () => {
    if (document.querySelector('.global-video-background')) return

    const video = document.createElement('video')
    video.src = bgVideo
    video.className = 'global-video-background'
    video.autoplay = true
    video.loop = true
    video.muted = true
    video.playsInline = true

    const overlay = document.createElement('div')
    overlay.className = 'global-video-overlay'

    document.body.prepend(overlay)
    document.body.prepend(video)
}

if (app) {
    initBackground()

    // esto es cuando el usuario esta recuperando contraseña que viene de la url del correo
    //si viene de ahi carga esa si no carga la pagina principal
    // Buscamos si en la URL hay algo como "?token=..."
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
        // Venimos del correo
        // Cargamos la pantalla de ResetPassword en lugar del Login normal
        const resetForm = new ResetPasswordForm(app, token)
        resetForm.render()
    } else {
        // Flujo Normal de la App

        // Comprobamos la sesión como siempre
        // Nota: Añadimos un pequeño check para asegurarnos de que cargue el perfil fresco
        if (userController.isLoggedIn) {
            // Usuario ya logueado -> Perfil
            userController.loadProfile().then(() => {
                const userProfileContainer = new UserProfileContainer(app)
                userProfileContainer.render()
            })
        } else {
            // Usuario anónimo/nuevo -> Pantalla de acceso (Login/Registro)
            const accessContainer = new AccessContainer(app)
            accessContainer.render()
        }
    }
}
