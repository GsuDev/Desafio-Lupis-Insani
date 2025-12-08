import './userProfile.css'
import { userController } from '../../controllers/UserController'
import type { User } from '../../models/models'
import UserSettingsComponent from '../userSettings/userSettings'
import { gameController } from '../../controllers/GameController'
import { renderWaitingRoom } from '../waitingRoom/waiting-room'
import JoinGameModal from '../joinGameModal/JoinGameModal'
import AccessContainer from '../accessContainer/AccessContainer'
import { LoginFormComponent } from '../loginForm/loginForm'
import UserProfileContainer from '../userProfileContainer/userProfileContainer'
import defaultAvatar from '../../assets/characters/werewolf.png'
import AdminPanelComponent from '../adminPanel/adminPanel'


/**
 * Componente que muestra la tarjeta del perfil del usuario
 * pinta la foto de perfil el nombre y los botones
 */
export class UserProfileComponent {
    private container: HTMLElement
    // aqui guardamos todos los datos
    private userData: User

    constructor(container: HTMLElement) {
        this.container = container

        // si hay usuario logueado lo cogemos  si no  ponemos uno por defecto
        //lo mismo que en la otra, no se va a dar el caso pero TS me da error si no lo pongo asi
        let user = userController.currentUser
        if (!user) {
            user = {
                id: 9999,
                nickname: 'Anónimo',
                name: 'Usuario Anónimo',
                lastname: null,
                email: null,
                birthdate: null,
                profile_url: null,
                is_anonymous: true,
            }
        }
        this.userData = user
    }

    /**
     * metodo para pintar el html del perfil.
     */
    render(): void {
        // limpiamos el contenedor por si habia algo antes
        this.container.innerHTML = ''

        // tarjeta del perfil
        // creamos el div principal que hara de tarjeta
        const card = document.createElement('div')
        card.className = 'user-profile-card'

        // foto de perfil (avatar de juego)
        // se crea la imagen del usuario
        const avatarImg = document.createElement('img')
        avatarImg.className = 'avatar-img'
        // Si tiene foto la usamos  si no generamos un robot aleatorio con su nombre
        avatarImg.src = this.userData.profile_url || defaultAvatar

        // info y configuracion
        // Un div para agrupar el nombre y el boton de configuracion
        const infoDiv = document.createElement('div')

        // nombre del usuario
        const nickTitle = document.createElement('h2')
        nickTitle.className = 'user-nickname'
        nickTitle.textContent = this.userData.nickname || 'Invitado'

        // Boton pequeño para config
        const configBtn = document.createElement('button')
        configBtn.className = 'config-btn-mini'
        configBtn.textContent = '⚙️ Config'
        // Al hacer click, por ahora solo mostramos un log
        configBtn.onclick = () => {
            const userSettings = new UserSettingsComponent(this.container)
            userSettings.render()
        }

        const isAdmin = this.userData.roles?.some(role => role.name === 'admin')

        let adminBtn: HTMLButtonElement | null = null;

        if (isAdmin) {
            adminBtn = document.createElement('button')
            adminBtn.className = 'config-btn-mini'
            adminBtn.textContent = '🛡️ Panel'
            adminBtn.style.marginLeft = '10px'
            // Estilo rápido para diferenciarlo
           
            
            // Al hacer click, cargamos el Panel de Administración en #app
            adminBtn.onclick = () => {
                const app = document.getElementById('app')
                if (!app) return
                const adminPanel = new AdminPanelComponent(app)
                adminPanel.render()
            }
        }
        // -------------------------------------------

        // Añadimos los elementos al infoDiv
        infoDiv.append(nickTitle, configBtn)
        if (adminBtn) {
            infoDiv.appendChild(adminBtn)
        }

        // botones
        // div para los botones de jugar crear o unirse
        const actionsDiv = document.createElement('div')
        actionsDiv.className = 'actions-section'

        // boton para crear la partida
        const createBtn = document.createElement('button')
        createBtn.className = 'btn-action primary'
        createBtn.textContent = 'Crear Sala'
        createBtn.onclick = async () => {
            // TODO: Crear sala
            const gameId = await gameController.handleCreateGame()
            await gameController.handleLoadGame(gameId)
            const app = document.getElementById('app')
            const game = gameController.currentGame
            if (app && game) {
                renderWaitingRoom(app, game.id)
            } else {
                window.alert('no hay partida')
                console.log('partida: ', game)
            }
        }

        // boton para unirse a la partida
        const joinBtn = document.createElement('button')
        joinBtn.className = 'btn-action secondary'
        joinBtn.textContent = 'Unirse a Sala'
        joinBtn.onclick = async () => {
            await gameController.handleLoadGame(1)
            const app = document.getElementById('app')
            const game = gameController.currentGame

            if (app && game) {
                const modal = new JoinGameModal(app, () => {
                    app.innerHTML = ''
                    const accessContainer = new UserProfileContainer(app)
                    accessContainer.render()
                })

                modal.render()
            }
        }

        // se añaden los botones
        actionsDiv.append(createBtn, joinBtn)

        // se junta todo en la tarjeta

        card.append(avatarImg, infoDiv, actionsDiv)

        // se mete en el padre
        this.container.appendChild(card)
    }
}

export default UserProfileComponent
