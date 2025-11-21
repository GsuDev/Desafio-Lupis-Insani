import type { Participant } from '../models/Participant'
import { ParticipantComponent } from '../components/participant/participant'
import { getGameParticipants } from '../providers/game.provider'

class ParticipantController {
    private static instance: ParticipantController

    private constructor() {}

    static getInstance(): ParticipantController {
        if (!ParticipantController.instance) {
            ParticipantController.instance = new ParticipantController()
        }
        return ParticipantController.instance
    }

    /**
     * Devuelve un array de participantes del currentGame.
     * y extraer los participantes de ahí.
     */

    async getParticipants(gameId: string): Promise<Participant[]> {
        // Esto llama directamente a getGameParticipants del gameProvider
        const participants = await getGameParticipants(gameId)
        return participants
    }

    renderParticipantList(
        participants: Participant[],
        container: HTMLElement
    ): void {
        // Limpia el contenedor antes de agregar nuevos participantes
        container.innerHTML = ''

        // Itera sobre cada participante
        participants.forEach((participant) => {
            this.loadParticipant(participant, container)
        })
    }

    private loadParticipant(
        participant: Participant,
        container: HTMLElement
    ): void {
        const participantComponent = new ParticipantComponent(participant)

        const participantElement = participantComponent.render()

        // Agrega el elemento al contenedor
        container.appendChild(participantElement)
    }

    public isHost(): boolean {
        const currentUser = JSON.parse(
            localStorage.getItem('currentUser') || '{}'
        )
        const currentGame = JSON.parse(
            localStorage.getItem('currentGame') || '{}'
        )

        // Asegúrate de que 'participants' sea un array para evitar errores.
        const participants = currentGame.participants || []
        let host_id = 0
        for (const participant of participants) {
            if (participant.is_host) {
                host_id = participant.id
            }
        }

        // Si no se encuentra un host, o el usuario actual no tiene ID, no puede ser el host.
        return host_id !== 0 && currentUser.id === host_id
    }
}

export const participantController = ParticipantController.getInstance()
