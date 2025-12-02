import AccessContainer from './components/accessContainer/AccessContainer'
import UserProfileContainer from './components/userProfileContainer/userProfileContainer'
import { userController } from './controllers/UserController'
import bgVideo from './assets/Animación_de_Fondo_para_Videojuego.mp4'
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
}
