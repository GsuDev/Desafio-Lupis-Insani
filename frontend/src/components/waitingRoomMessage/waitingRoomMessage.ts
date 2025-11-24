import './waitingRoomMessage.css'
import type { IMessageData } from '../../interfaces/game.models'


export class WaitingRoomMessage {
    private data: IMessageData

    constructor(data: IMessageData) {
        this.data = data
    }


    //Devuelve el elemento del mensaje montado

    public getElement(): HTMLElement {
        const messageEl = document.createElement('div')
        messageEl.classList.add('waiting-room-message')
        messageEl.innerHTML = `
            <div class="chat-image">
                <img src="${this.data.imageUrl}" alt="avatar">
            </div>
            <div class="chat-content"> <span class="chat-user">${this.data.playerName}:</span>
                <span class="chat-message">${this.data.message}</span>
            </div>
        `
        return messageEl
    }


}