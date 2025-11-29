import { GlobalChannel } from '../channels/GlobalChannel'
import { ChatManager } from '../managers/Chat.manager'
import type { EventData } from '../types/events.types'

export class GlobalEventRouter {
    private channel: GlobalChannel

    constructor(channel: GlobalChannel) {
        this.channel = channel
    }

    routeEvent(event: string, data: EventData): void {
        //const category = event.split('.')[0];

        ChatManager.handleEvent(event, data, 'game')
        //Sistema para general popups, comentado porque no nos da la vida a implementar mas cosas,
        //pero estaría practicamente hecho

        // switch(category){
        //     case 'chat':
        //         //como game ya se encarga del general, no hace falta crear un canal "global"
        //         ChatManager.handleEvent(event, data, 'game');
        //         break;
        //     default:
        //         console.warn(`⚠️ Evento sin manager asignado: ${event}`, data);
        // }
        //Se pueden implementar un manager que cree popups
        //Y llamar a ese metodo para generar los avisos importantes
    }

    public disconnect(): void {
        this.channel.leave()
    }
}
