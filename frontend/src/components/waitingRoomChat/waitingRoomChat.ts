import './watitingRoomChat.css'
import { WaitingRoomMessage } from '../waitingRoomMessage/waitingRoomMessage'
import type { Message } from '../../models/models'

export class WaitingRoomChat {
    // propiedades de instancia
    private container: HTMLElement
    private messages: Message[]

    // elementos del dom
    private chatListElement!: HTMLElement
    private inputElement!: HTMLInputElement
    private sendButton!: HTMLButtonElement

    // callback
    private onSendMessage?: (message: string) => void

    // referencias estáticas compartidas
    private static globalMessages: Message[] = []
    private static globalChatListElement: HTMLElement | null = null

    constructor(
        container: HTMLElement,
        initialMessages: Message[] = [],
        onSendMessage?: (message: string) => void
    ) {
        if (!container) {
            throw new Error(`No se pudo encontrar el contenedor`)
        }
        this.container = container
        this.messages = initialMessages
        WaitingRoomChat.globalMessages = initialMessages
        this.onSendMessage = onSendMessage
    }

    public render(): void {
        this.initDOM()
        this.attachEventListeners()
        this.updateView()
    }

    private initDOM(): void {
        this.container.innerHTML = ''

        const section = document.createElement('section')
        section.className = 'wr-chat-area'

        const header = document.createElement('header')
        header.className = 'wr-chat-header'
        header.textContent = 'General prepartida'

        this.chatListElement = document.createElement('div')
        this.chatListElement.className = 'wr-chat-messages-list'
        this.chatListElement.id = 'chat-messages-area'

        // guardo referencia estática
        WaitingRoomChat.globalChatListElement = this.chatListElement

        const inputArea = document.createElement('footer')
        inputArea.className = 'wr-chat-input-area'

        this.inputElement = document.createElement('input')
        this.inputElement.type = 'text'
        this.inputElement.placeholder = 'Escribe un mensaje...'
        this.inputElement.className = 'wr-chat-input'

        this.sendButton = document.createElement('button')
        this.sendButton.className = 'wr-chat-send-button'
        this.sendButton.textContent = 'Enviar'

        inputArea.appendChild(this.inputElement)
        inputArea.appendChild(this.sendButton)

        section.appendChild(header)
        section.appendChild(this.chatListElement)
        section.appendChild(inputArea)

        this.container.appendChild(section)
    }

    private attachEventListeners(): void {
        this.sendButton.addEventListener('click', () => this.handleSend())
        this.inputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleSend()
            }
        })
    }

    private handleSend(): void {
        const message = this.inputElement.value.trim()
        if (message) {
            if (this.onSendMessage) {
                this.onSendMessage(message)
            }
            this.inputElement.value = ''
        }
    }

    private updateView(): void {
        this.chatListElement.innerHTML = ''

        if (this.messages.length > 0) {
            this.messages.forEach((message) => {
                const messageComponent = new WaitingRoomMessage(message)
                const messageElement = messageComponent.getElement()
                this.chatListElement.appendChild(messageElement)
            })
            this.scrollToBottom()
        } else {
            this.chatListElement.innerHTML =
                '<div class="empty-chat">Aún no hay mensajes</div>'
        }
    }

    private scrollToBottom(): void {
        this.chatListElement.scrollTop = this.chatListElement.scrollHeight
    }

    // método estático para añadir mensajes sin instanciar
    public static addMessage(message: Message): void {
        this.globalMessages.push(message)

        if (this.globalChatListElement) {
            this.globalChatListElement.innerHTML = ''
            this.globalMessages.forEach((msg) => {
                const messageComponent = new WaitingRoomMessage(msg)
                const messageElement = messageComponent.getElement()
                this.globalChatListElement!.appendChild(messageElement)
            })
            this.globalChatListElement.scrollTop =
                this.globalChatListElement.scrollHeight
        }
    }
}
