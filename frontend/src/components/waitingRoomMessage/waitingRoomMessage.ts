import type { Message } from '../../models/models'
import './waitingRoomMessage.css'

export class WaitingRoomMessage {
    private data: Message

    constructor(data: Message) {
        this.data = data
    }

    //Devuelve el elemento del mensaje montado

    public getElement(): HTMLElement {
        const messageEl = document.createElement('div')
        messageEl.classList.add('waiting-room-message')
        messageEl.innerHTML = `
      
            <div class="chat-content"> 
                <p class="chat-user">${this.data.nickname}:</p>
                <p class="chat-message">${this.data.message}</p>
            </div>
        `
        /**      <div class="chat-image">
                <img src="${this.data.imageUrl}" alt="avatar">
            </div> */
        return messageEl
    }
}
