import type { Participant } from '../../models/models'
import './participant.css'

export class ParticipantComponent {
    private participant: Participant

    constructor(participant: Participant) {
        this.participant = participant
    }

    render(): HTMLElement {
        const wrapper = document.createElement('div')
        wrapper.className = 'participant-card'

        // Avatar circular
        const avatar = document.createElement('div')

        avatar.className = 'participant-avatar'
        if (!this.participant.profileUrl) {
            avatar.textContent = this.participant.nickname
                .charAt(0)
                .toUpperCase()
        } else {
            const img = document.createElement('img')
            img.src = this.participant.profileUrl
            avatar.appendChild(img)
        }

        // Nombre del participante
        const nameWrapper = document.createElement('div')
        nameWrapper.className = 'participant-info'

        const name = document.createElement('span')
        name.className = 'participant-name'
        name.textContent = this.participant.nickname

        // Indicador de bot (opcional)
        // A esto hay que darle una vuelta mas adelante

        if (this.participant.isBot) {
            const botBadge = document.createElement('span')
            botBadge.className = 'participant-badge'
            botBadge.textContent = 'BOT'
            nameWrapper.append(name, botBadge)
        } else {
            nameWrapper.append(name)
        }

        wrapper.append(avatar, nameWrapper)
        return wrapper
    }
}
