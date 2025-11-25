import './watitingRoomChat.css'
import type { IMessageData } from '../../interfaces/game.models'
import { WaitingRoomMessage } from '../waitingRoomMessage/waitingRoomMessage'

export class WaitingRoomChat {
    //las propiedades
    private container: HTMLElement
    private messages: IMessageData[]

    //elementos del dom
    private chatListElement!: HTMLElement
    private inputElement!: HTMLInputElement
    private sendButton!: HTMLButtonElement

    //callback para cuando un usuario envia el mensaje, esto tiene que hacer conexion a back
    private onSendMessage?: (message: string) => void

    constructor(
        container: HTMLElement,
        initialMessages: IMessageData[] = [],
        onSendMessage?: (message: string) => void
    ) {
        if (!container) {
            // para controlar que se ha pasado correctamente
            throw new Error(`No se pudo encontrar el contenedor`)
        }
        this.container = container
        this.messages = initialMessages
        this.onSendMessage = onSendMessage
    }

    public render(): void {
        this.initDOM()
        this.attachEventListeners()
        this.updateView()
    }

    private initDOM(): void {
        //limpio el contenedor vacio que le he pasado
        this.container.innerHTML = ''

        const section = document.createElement('section')
        section.className = 'wr-chat-area'

        //header
        const header = document.createElement('header')
        header.className = 'wr-chat-header'
        header.textContent = 'General prepartida'

        //aqui es donde van los mensajes
        this.chatListElement = document.createElement('div')
        this.chatListElement.className = 'wr-chat-messages-list'
        this.chatListElement.id = 'chat-messages-area'

        //Area del input (que es el footer)
        const inputArea = document.createElement('footer')
        inputArea.className = 'wr-chat-input-area'

        this.inputElement = document.createElement('input')
        this.inputElement.type = 'text'
        this.inputElement.placeholder = 'Escribe un mensaje...'
        this.inputElement.className = 'wr-chat-input'

        //boton de enviar
        this.sendButton = document.createElement('button')
        this.sendButton.className = 'wr-chat-send-button'
        this.sendButton.textContent = 'Enviar' // cambiar por un simbolo

        //montaje de todo
        inputArea.appendChild(this.inputElement)
        inputArea.appendChild(this.sendButton)

        section.appendChild(header)
        section.appendChild(this.chatListElement)
        section.appendChild(inputArea)

        this.container.appendChild(section)
    }

    private attachEventListeners(): void {
        //controlo que pulsen boton
        this.sendButton.addEventListener('click', () => this.handleSend())

        //controlo que pulsen enter
        this.inputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleSend()
            }
        })
    }

    private handleSend(): void {
        const message = this.inputElement.value.trim()

        if (message) {
            //con esto envia el callback al controllador de que hay un mensaje
            if (this.onSendMessage) {
                //const messageData = new IMessageData....
                //this.onSendMessage(messageData)
                this.onSendMessage(message) //creo que esto lo tengo que cambiar para enviar los datos de la persona
            }
            this.inputElement.value = ''
        }
    }

    private updateView(): void {
        //actualiza la vista iterando los datos, donde controlo que la vista baje automaticamente
        this.chatListElement.innerHTML = ''

        if (this.messages.length > 0) {
            this.messages.forEach((message) => {
                const messageComponent = new WaitingRoomMessage(message)
                const messageElement = messageComponent.getElement() //el render
                this.chatListElement.appendChild(messageElement)
            })
            //hago el auto scroll
            this.scrollToBottom()
        } else {
            this.chatListElement.innerHTML =
                '<div class="empty-chat">Aún no hay mensajes</div>'
        }
    }

    private scrollToBottom(): void {
        this.chatListElement.scrollTop = this.chatListElement.scrollHeight
    }

    //metodo para añadir un mensaje desde fuera
    public addMessage(message: IMessageData): void {
        this.messages.push(message)
        this.updateView()
    }
}
