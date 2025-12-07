import './userProfileContainer.css'
import { userController } from '../../controllers/UserController'

import UserProfileComponent from '../userProfile/userProfile'
import AccessContainer from '../accessContainer/AccessContainer'
import UserStatistics from '../userStatistics/userStatistics'


/**
 * clase principal del perfil de usuario.
 * basicamente es la carcasa que tiene el header y divide la pantalla en dos.
 */
class UserProfileContainer {
    // aqui guardamos el elemento HTML donde vamos a pintar todo
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    /**
     * mtodo principal que se encarga de crear todo el html y mostrarlo.
     * es como el 'main' de este componente.
     */
    render(): void {
        // limpiamos lo que hubiera antes para no duplicar cosas
        this.container.innerHTML = ''


        // fondo y header
        //  div principal que envuelve todo
        const root = document.createElement('div')
        root.className = 'user-profile-container'

        // header titulo y logout
        // cabecera de arriba
        const header = document.createElement('header')
        header.className = 'dashboard-header'

        // titulo del juego
        const title = document.createElement('h1')
        title.className = 'dashboard-title'
        title.textContent = 'LOBOS DE CASTRONEGRO'

        // boton para salir de la sesion
        const logoutBtn = document.createElement('button')
        logoutBtn.className = 'logout-btn'
        logoutBtn.textContent = 'Cerrar Sesión'
        // cuando hacen click llamamos a la funcion de logout
        logoutBtn.onclick = () => {
            userController.logout()
            const app = document.getElementById('app')
            if (app) {
                app.innerHTML = ''
                const accessContainer = new AccessContainer(app)
                accessContainer.render()
            }
        }

        // metemos el título y el boton dentro del header
        header.append(title, logoutBtn)

        // rejilla con los dos huecos
        // Este div va a usar grid o flex para poner las cosas una al lado de la otra
        const layout = document.createElement('div')
        layout.className = 'dashboard-layout'

        // hueco izquierdo del perfil
        // Aquí es donde va a ir la foto y los datos del usuario
        const profileSection = document.createElement('div')
        profileSection.id = 'profile-section'
        profileSection.className = 'dashboard-section'

        // hueco derecho para las estadisticas que esta vacio de momento
        // Aquí irán las gráficas o datos de partidas en el futuro
        const statsSection = document.createElement('div')
        statsSection.id = 'stats-section'
        statsSection.className = 'dashboard-section'
        //statsSection.innerHTML = '<p>Estadísticas próximamente...</p>'
        const userStats = new UserStatistics(statsSection)
        userStats.render()

        // instanciamos el componente del perfil
        // Creamos el componente de perfil pasándole el div donde queremos que se pinte
        const userProfile = new UserProfileComponent(profileSection)
        // Le decimos que se pinte
        userProfile.render()

        // ensamblado final
        // metemos las dos secciones en el layout
        layout.append(profileSection, statsSection)
        // metemos el header y el layout en el root
        root.append(header, layout)
        // Y finalmente metemos todo en el contenedor principal de la página
        this.container.appendChild(root)
    }

    /**
     * función asíncrona para cerrar sesión.
     * l lama al controlador y luego recarga la página para ir al login.
     */
    private async handleLogout(): Promise<void> {
        await userController.logout()
        window.location.reload()
    }
}

export default UserProfileContainer
