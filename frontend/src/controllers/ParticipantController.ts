
import type { Participant } from '../models/Participant';
import { ParticipantComponent } from '../components/participant/participant';
import { getGameParticipants } from '../providers/game.provider.mock';

class ParticipantController {
    private static instance: ParticipantController;

    private constructor() {}

    public static getInstance(): ParticipantController {
        if (!ParticipantController.instance) {
            ParticipantController.instance = new ParticipantController();
        }
        return ParticipantController.instance;
    }

    /**
     * Devuelve un array de participantes del currentGame.
     * y extraer los participantes de ahí.
     */
    
    public async getParticipants(gameId: string): Promise<Participant[]> {
        // Esto llama directamente a getGameParticipants del gameProvider
        const participants = await getGameParticipants(gameId);
        return participants;
    }



    public renderParticipantList(participants: Participant[], container: HTMLElement): void {
        // Limpia el contenedor antes de agregar nuevos participantes
        container.innerHTML = '';

        // Itera sobre cada participante
        participants.forEach(participant => {
            this.loadParticipant(participant, container);
        });
    }

    
    private loadParticipant(participant: Participant, container: HTMLElement): void {
        const participantComponent = new ParticipantComponent(participant);
        const participantElement = participantComponent.render();
        
        // Agrega el elemento al contenedor
        container.appendChild(participantElement);
    }
}

export const participantController = ParticipantController.getInstance();