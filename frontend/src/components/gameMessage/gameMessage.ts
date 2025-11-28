import type { Message } from '../../models/models'
import './gameMessage.css'

//componente del cuadrito del texto del mensaje en el chat

export class GameMessage {
    private container: HTMLElement
    private data: Message
    private isMine: boolean // este lo hemos puesto para que salga a la derecha en el chat del usuario que lo escribe

    constructor(data: Message, isMine: boolean) {
        this.data = data
        this.isMine = isMine

        this.container = document.createElement('div')
    }

    render(): HTMLElement {
        this.container.className = 'game-message-root'

        // si el mensaje es mio se pone en la derecha del chat
        if (this.isMine) {
            this.container.classList.add('message-me')
        } else {
            this.container.classList.add('message-other')
        }

        const avatarSection = document.createElement('div')
        avatarSection.className = 'message-avatar-section'

        const avatar = document.createElement('div')
        avatar.className = 'message-avatar'

        // si hay url foto de perfil la ponemos
        if (this.data.profileUrl) {
            const img = document.createElement('img')
            img.src = this.data.profileUrl
            img.alt = this.data.nickname
            avatar.appendChild(img)
        } else {
            avatar.textContent = 'A'.charAt(0).toUpperCase()
            avatar.style.backgroundColor = '#ccc'
        }

        avatarSection.appendChild(avatar)

        // nombre + texto +  hora
        const contentSection = document.createElement('div')
        contentSection.className = 'message-content-section'

        // muestra el nombre de los demas menajes pero tu nombre en cada mensaje tuyo no
        if (!this.isMine) {
            const name = document.createElement('span')
            name.className = 'message-name'
            name.textContent = this.data.nickname
            contentSection.appendChild(name)
        }

        // burbuja dse texto
        const bubble = document.createElement('div')
        bubble.className = 'message-bubble'
        console.log('mensajeeeeee ---->: ', this.data.message)
        bubble.textContent = this.data.message // usa el campo mensaje

        const time = document.createElement('span')
        time.className = 'message-time'
        time.textContent = this.formatTime(this.data.time)

        contentSection.appendChild(bubble)
        contentSection.appendChild(time)

        this.container.appendChild(avatarSection)
        this.container.appendChild(contentSection)

        return this.container
    }

    /**
     * Formatea la fecha string "2023-11-24T10:00:00" a "10:00"
     */
    private formatTime(dateString: string): string {
        try {
            const date = new Date(dateString)
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch (e) {
            return ''
        }
    }
}
