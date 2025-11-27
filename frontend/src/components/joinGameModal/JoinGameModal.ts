import './JoinGameModal.css'

import { gameController } from '../../controllers/GameController'
import { renderWaitingRoom } from '../waitingRoom/waiting-room'

export class JoinGameModal {
    private container: HTMLElement
    private onClose: () => void //Callback para controlar si se ha cerrado/cancelado y no se ha buscado partida

    constructor(container: HTMLElement, onClose: () => void) {
        this.container = container
        this.onClose = onClose
    }

    render(): void {
        const container = this.container

        //Para crear el overlay translucido
        const root = document.createElement('div')
        root.classList.add('join-game-modal-overlay')

        //Contenedor para el modal
        const modalBox = document.createElement('div')
        modalBox.classList.add('join-game-modal-box')

        //ELEMENTOS DEL MODAL

        //header (cambiar el div a header ? )
        const header = document.createElement('div')
        header.classList.add('modal-header')

        const title = document.createElement('h2')
        title.textContent = 'Unirse a sala'
        header.appendChild(title)

        //contenido
        const content = document.createElement('section')
        content.className = 'modal-content'

        //input del codigo de la sala

        const input = document.createElement('input')
        input.type = 'text'
        input.placeholder = 'Código de sala (actualmente id)'
        input.className = 'modal-input'
        input.id = 'game-id-input'

        //area del feedback de errores
        const errorMsg = document.createElement('p')
        errorMsg.className = 'error-msg'
        errorMsg.style.display = 'none'
        errorMsg.id = 'join-error-msg'

        content.appendChild(input)
        content.appendChild(errorMsg)

        //footer (los botones)
        const actions = document.createElement('div')
        actions.className = 'modal-actions'

        //boton de cancelar
        const btnCancel = document.createElement('button')
        btnCancel.className = 'btn btn-cancel'
        btnCancel.textContent = 'Cancelar'
        btnCancel.onclick = () => this.handleCancel(root)

        //boton de ir a sala
        const btnJoin = document.createElement('button')
        btnJoin.className = 'btn btn-join'
        btnJoin.textContent = 'Ir a SALA'
        btnJoin.onclick = () =>
            this.handleJoin(Number(input.value), errorMsg, root)

        actions.appendChild(btnCancel)
        actions.appendChild(btnJoin)

        //Parte de ensamblado
        modalBox.appendChild(header)
        modalBox.appendChild(content)
        modalBox.appendChild(actions)

        root.appendChild(modalBox)
        container.appendChild(root)
    }

    //Logica interna
    private handleCancel(rootElement: HTMLElement): void {
        //Opcion 1
        rootElement.remove() //Destruir el modal del DOM
        //Opcion 2
        //this.onClose()//ejecutar callback
    }

    private async handleJoin(
        gameId: number,
        errorElement: HTMLElement,
        rootElement: HTMLElement
    ): Promise<void> {
        if (!gameId) {
            this.showError(errorElement, 'Por favor ingresa un código')
            return
        }

        try {
            //limpiar si hay algun error previo
            errorElement.style.display = 'none'

            //aqui llamo al provider
            const gameData = await gameController.handleJoin(gameId)

            //aqui debería de guardar en memoria
            if (gameData) {
                gameController.setGameData(gameData)
            }

            //aqui cambiar el componente a waiting-room
            const app = document.getElementById('app')

            if (!app) {
                throw new Error('Imposible renderizar')
            }
            renderWaitingRoom(app, gameId)

            //y cerrar el modal
            this.handleCancel(rootElement)
        } catch (error: any) {
            this.showError(errorElement, error.message)
        }
    }

    private showError(errorElement: HTMLElement, message: string): void {
        errorElement.textContent = message
        errorElement.style.display = 'block'
        errorElement.style.color = 'red'
    }
}

export default JoinGameModal

/* EJEMPLO A CARGAR 

import JoinGameModal from './components/JoinGameModal';

const appContainer = document.getElementById('app');

// Función para abrir el modal
function openJoinModal() {
    const modal = new JoinGameModal(appContainer, () => {
        console.log('El usuario canceló o cerró el modal'); 
        // Aquí podrías recargar el menú principal si fuera necesario
    });
    
    modal.render();
}


*/
