
import './gameChat.css';
import { GameMessage } from '../gameMessage/gameMessage';
import type { Message } from '../../interfaces/game.models';


export class GameChat {
    private isWolf: boolean;
    private gameId: number;
    
    
    private root: HTMLElement;
    private messagesContainer: HTMLElement;
    private inputElement: HTMLInputElement;
    private tabGeneral: HTMLElement;
    private tabWolves: HTMLElement;

    
    private currentTab: 'general' | 'wolves' = 'general';

    constructor(isWolf: boolean, gameId: number) {
        this.isWolf = isWolf;
        this.gameId = gameId;

       
        this.root = document.createElement('div');
        this.messagesContainer = document.createElement('div');
        this.inputElement = document.createElement('input');
        
        
        this.tabGeneral = document.createElement('button');
        this.tabWolves = document.createElement('button');
    }

    
    render(): HTMLElement {
        this.root.className = 'game-chat-root';

        
        const tabsContainer = this.renderTabs();
        
        
        this.messagesContainer.className = 'chat-messages-area';
        
        // input para escribir y boton de enviar
        const footer = this.renderInputArea();

        
        this.root.appendChild(tabsContainer);
        this.root.appendChild(this.messagesContainer);
        this.root.appendChild(footer);

        return this.root;
    }

    
    private renderTabs(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'chat-tabs-container';

        this.tabGeneral.textContent = 'General';
        this.tabGeneral.className = 'chat-tab active'; // Empieza activa
        this.tabGeneral.onclick = () => this.switchTab('general');

        // tab lobo solo es visible si lobo true
        this.tabWolves.textContent = 'Lobos';
        this.tabWolves.className = 'chat-tab wolf-tab';
        this.tabWolves.onclick = () => this.switchTab('wolves');

        container.appendChild(this.tabGeneral);

        // visualizacion segun el rol que se teng
        if (this.isWolf) {
            container.appendChild(this.tabWolves);
        }

        return container;
    }

    
    private renderInputArea(): HTMLElement {
        const footer = document.createElement('footer');
        footer.className = 'chat-footer';

        this.inputElement.type = 'text';
        this.inputElement.className = 'chat-input';
        this.inputElement.placeholder = 'Escribe algo...';
        
        // cuando pulsas enter
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.onSendMessage();
        });

        const sendBtn = document.createElement('button');
        sendBtn.className = 'chat-send-btn';
        sendBtn.innerHTML = '📩'; 
        sendBtn.onclick = () => this.onSendMessage();

        footer.appendChild(this.inputElement);
        footer.appendChild(sendBtn);

        return footer;
    }

    /**
     * metodo interno para cambiar de pestaña
     */
    private switchTab(tab: 'general' | 'wolves'): void {
        this.currentTab = tab;
        
        if (tab === 'general') {
            this.tabGeneral.classList.add('active');
            this.tabWolves.classList.remove('active');
            this.messagesContainer.style.background = '#fff'; // Ejemplo visual
        } else {
            this.tabGeneral.classList.remove('active');
            this.tabWolves.classList.add('active');
            this.messagesContainer.style.background = '#ffe5e5'; // Color rojizo para lobos
        }
        
        //para debuggar
        console.log(`🔀 Cambiado a pestaña: ${tab}`);
        // Aquí limpiaremos mensajes y cargaremos los del canal correspondiente
    }

    /**
     * aqui se recoge el mensaje y en el futuro llamara al controller
     */
    public onSendMessage(): void {
        const text = this.inputElement.value.trim();
        if (!text) return;

        //para debuggar
        console.log(`📤 Enviando mensaje en canal [${this.currentTab}]: ${text}`);
        
        // conectar con GameChatController
        
        // se limpia input
        this.inputElement.value = '';
    }

    /**
     * para añadir a la lista
     */
    public addMessage(msgData: Message, isMine:boolean): void {
        const messageComponent = new GameMessage(msgData,isMine);
        this.messagesContainer.appendChild(messageComponent.render());
        this.scrollToBottom();
    }

    
    private scrollToBottom(): void {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}