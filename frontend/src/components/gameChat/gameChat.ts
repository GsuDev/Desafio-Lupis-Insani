import './gameChat.css'
import { GameMessage } from '../gameMessage/gameMessage'
import type { Message } from '../../interfaces/game.models'

// Definimos una interfaz mínima para no importar la clase entera y evitar ciclos raros
interface IChatController {
    sendMessage(text: string): void
}

export class GameChat {
    private isWolf: boolean
    private gameId: number

    private generalContainer: HTMLElement
    private wolvesContainer: HTMLElement

    private root: HTMLElement
    private inputElement: HTMLInputElement
    private tabGeneral: HTMLElement
    private tabWolves: HTMLElement

    // Referencia al controlador como pide la hu
    private controller: IChatController | null = null

    private currentTab: 'general' | 'wolves' = 'general'

    constructor(isWolf: boolean, gameId: number) {
        this.isWolf = isWolf
        this.gameId = gameId

        this.root = document.createElement('div')

        // Inicializamos los dos contenedores
        this.generalContainer = document.createElement('div')
        this.wolvesContainer = document.createElement('div')

        this.inputElement = document.createElement('input')

        this.tabGeneral = document.createElement('button')
        this.tabWolves = document.createElement('button')
    }

    render(): HTMLElement {
        this.root.className = 'game-chat-root'

        const tabsContainer = this.renderTabs()

        this.generalContainer.className = 'chat-messages-area'
        this.wolvesContainer.className = 'chat-messages-area'

        // estado inicial la ventana de chat general se ve, los lobos oculto
        this.generalContainer.style.display = 'flex' // Asegurar que se ve
        this.wolvesContainer.style.display = 'none'

        // input para escribir y boton de enviar
        const footer = this.renderInputArea()

        this.root.appendChild(tabsContainer)
        this.root.appendChild(this.generalContainer)
        this.root.appendChild(this.wolvesContainer)
        this.root.appendChild(footer)

        return this.root
    }

    private renderTabs(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'chat-tabs-container'

        this.tabGeneral.textContent = 'General'
        this.tabGeneral.className = 'chat-tab active' // Empieza activa
        this.tabGeneral.onclick = () => this.switchTab('general')

        // Tab lobo solo es visible si lobo true
        this.tabWolves.textContent = 'Lobos'
        this.tabWolves.className = 'chat-tab wolf-tab'
        this.tabWolves.onclick = () => this.switchTab('wolves')

        container.appendChild(this.tabGeneral)

        // Visualizacion segun el rol que se tenga
        if (this.isWolf) {
            container.appendChild(this.tabWolves)
        }

        return container
    }

    private renderInputArea(): HTMLElement {
        const footer = document.createElement('footer')
        footer.className = 'chat-footer'

        this.inputElement.type = 'text'
        this.inputElement.className = 'chat-input'
        this.inputElement.placeholder = 'Escribe algo...'

        // Cuando pulsas enter
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.onSendMessage()
        })

        const sendBtn = document.createElement('button')
        sendBtn.className = 'chat-send-btn'
        sendBtn.innerHTML = '📩'
        sendBtn.onclick = () => this.onSendMessage()

        footer.appendChild(this.inputElement)
        footer.appendChild(sendBtn)

        return footer
    }

    /**
     * Metodo interno para cambiar de pestaña
     */
    private switchTab(tab: 'general' | 'wolves'): void {
        this.currentTab = tab

        if (tab === 'general') {
            this.tabGeneral.classList.add('active')
            this.tabWolves.classList.remove('active')

            this.generalContainer.style.display = 'flex'
            this.wolvesContainer.style.display = 'none'
        } else {
            this.tabGeneral.classList.remove('active')
            this.tabWolves.classList.add('active')

            this.generalContainer.style.display = 'none'
            this.wolvesContainer.style.display = 'flex'
        }

        //debug
        console.log(`🔀 Cambiado a pestaña: ${tab}`)
        this.scrollToBottom()
    }

    // Metodo para vincular el controlador
    public setController(controller: IChatController) {
        this.controller = controller
    }

    /**
     * Aqui se recoge el mensaje y llama al controller
     */
    public onSendMessage(): void {
        const text = this.inputElement.value.trim()
        if (!text) return

        // Bloquear envío si estoy en General para probar
        // la logica buena buena se implementara en otra hu
        if (this.currentTab === 'general') {
            alert('El chat General aún no está disponible.')
            return
        }

        //debug
        console.log(`📤 Vista: Usuario quiere enviar: ${text}`)

        // Llamamos al controlador si existe
        if (this.controller) {
            this.controller.sendMessage(text)
        }

        // Se limpia input
        this.inputElement.value = ''
    }

    /**
     * Para añadir a la lista
     */
    public addMessage(
        msgData: Message,
        isMine: boolean,
        targetTab: 'general' | 'wolves' = 'wolves'
    ): void {
        const messageComponent = new GameMessage(msgData, isMine)

        // Decidimos en qué caja meterlo
        const targetContainer =
            targetTab === 'general'
                ? this.generalContainer
                : this.wolvesContainer

        targetContainer.appendChild(messageComponent.render())
        this.scrollToBottom()
    }

    private scrollToBottom(): void {
        // Scroleamos el contenedor que esté visible
        if (this.currentTab === 'general') {
            this.generalContainer.scrollTop = this.generalContainer.scrollHeight
        } else {
            this.wolvesContainer.scrollTop = this.wolvesContainer.scrollHeight
        }
    }
}
