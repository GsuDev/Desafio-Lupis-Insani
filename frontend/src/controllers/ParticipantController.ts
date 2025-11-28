import { ParticipantComponent } from '../components/participant/participant'
import type { Participant } from '../models/models'
import { gameController } from './GameController'
import { userController } from './UserController'

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

    async getParticipants(): Promise<Participant[]> {
        // Esto llama directamente a getGameParticipants del gameProvider
        let participants = gameController.currentGame?.participants
        if (!participants) {
            participants = []
        }

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
        const currentUser = userController.currentUser
        const currentGame = gameController.currentGame
        if (!currentUser || !currentGame) {
            return false
        }
        // Asegúrate de que 'participants' sea un array para evitar errores.
        const participants = currentGame.participants || []
        let hostId = 0
        for (const participant of participants) {
            if (participant.isHost) {
                hostId = participant.id
            }
        }

        // Si no se encuentra un host, o el usuario actual no tiene ID, no puede ser el host.
        return hostId !== 0 && currentUser.id === hostId
    }
}

export const participantController = ParticipantController.getInstance()
