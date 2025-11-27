import { ChatController } from '../../controllers/GameChatController'
import type { Message } from '../../models/models'
import { GameMessage } from '../gameMessage/gameMessage'

export class GameChat {
    private isWolf: boolean
    private container: HTMLElement
    private currentTab: 'game' | 'wolves' = 'game'

    constructor(container: HTMLElement, isWolf: boolean) {
        this.container = container
        this.isWolf = isWolf
    }

    render() {
        // Crear elementos locales
        const root = document.createElement('div')
        root.className = 'game-chat-root'

        const generalContainer = document.createElement('div')
        generalContainer.id = 'game-messages-container'
        generalContainer.className = 'chat-messages-area'
        generalContainer.style.display = 'flex'

        const wolvesContainer = document.createElement('div')
        wolvesContainer.id = 'wolves-messages-container'
        wolvesContainer.className = 'chat-messages-area'
        wolvesContainer.style.display = 'none'

        const inputElement = document.createElement('input')
        inputElement.type = 'text'
        inputElement.className = 'chat-input'
        inputElement.placeholder = 'Escribe algo...'

        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.onSendMessage(inputElement)
        })

        const sendBtn = document.createElement('button')
        sendBtn.className = 'chat-send-btn'
        sendBtn.innerHTML = '📩'
        sendBtn.onclick = () => this.onSendMessage(inputElement)

        const footer = document.createElement('footer')
        footer.className = 'chat-footer'
        footer.appendChild(inputElement)
        footer.appendChild(sendBtn)

        // Tabs
        const tabGeneral = document.createElement('button')
        tabGeneral.textContent = 'General'
        tabGeneral.className = 'chat-tab active'
        tabGeneral.onclick = () => switchTab('game')

        const tabWolves = document.createElement('button')
        tabWolves.textContent = 'Lobos'
        tabWolves.className = 'chat-tab wolf-tab'
        tabWolves.onclick = () => switchTab('wolves')

        const tabsContainer = document.createElement('div')
        tabsContainer.className = 'chat-tabs-container'
        tabsContainer.appendChild(tabGeneral)
        if (this.isWolf) tabsContainer.appendChild(tabWolves)

        // Función local para cambiar de tab
        const switchTab = (tab: 'game' | 'wolves') => {
            this.currentTab = tab
            if (tab === 'game') {
                tabGeneral.classList.add('active')
                tabWolves.classList.remove('active')
                generalContainer.style.display = 'flex'
                wolvesContainer.style.display = 'none'
            } else {
                tabGeneral.classList.remove('active')
                tabWolves.classList.add('active')
                generalContainer.style.display = 'none'
                wolvesContainer.style.display = 'flex'
            }
            generalContainer.scrollTop = generalContainer.scrollHeight
            wolvesContainer.scrollTop = wolvesContainer.scrollHeight
        }

        // Append a root
        root.appendChild(tabsContainer)
        root.appendChild(generalContainer)
        root.appendChild(wolvesContainer)
        root.appendChild(footer)

        this.container.appendChild(root)
    }

    private async onSendMessage(inputElement: HTMLInputElement) {
        const text = inputElement.value.trim()
        if (!text) return
        if (this.currentTab === 'game') {
            await ChatController.sendToGame(text)
        } else {
            await ChatController.sendToWolves(text)
        }

        inputElement.value = ''
    }

    public static addMessage(
        msgData: Message,
        isMine: boolean,
        targetTab: 'game' | 'wolves' = 'wolves'
    ): void {
        const generalContainer = document.getElementById(
            'game-messages-container'
        )
        const wolvesContainer = document.getElementById(
            'wolves-messages-container'
        )

        const messageComponent = new GameMessage(msgData, isMine)
        if (!generalContainer || !wolvesContainer) {
            console.error(`❌ Error al recibir un mensaje`)
            alert('Error al recibir el mensaje. Intenta de nuevo.')
            return
        }
        const targetContainer =
            targetTab === 'game' ? generalContainer : wolvesContainer
        targetContainer.appendChild(messageComponent.render())
        targetContainer.scrollTop = targetContainer.scrollHeight
    }
}
