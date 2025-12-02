import './roleCard.css'
import wolfCardImg from '../../assets/carta-lobo-prueba.png'
import villagerCardImg from '../../assets/carta-aldeano-prueba.png'

export type PlayerRole = 'villager' | 'wolf' | 'seer' | 'hunter'

const roleImages: Record<PlayerRole, string> = {
    wolf: wolfCardImg,
    villager: villagerCardImg,
    seer: '',
    hunter: '',
}

export class RoleCard {
    private container: HTMLElement
    private role: PlayerRole

    constructor(container: HTMLElement, role: PlayerRole) {
        this.container = container
        this.role = role
    }

    render(): void {
        const card = document.createElement('div')

        card.className = `role-card role-${this.role}`

        if (roleImages[this.role]) {
            card.style.backgroundImage = `url(${roleImages[this.role]})`
        }

        card.title = `Tu rol: ${this.role.toUpperCase()}`
        this.container.appendChild(card)
    }
}

export default RoleCard
