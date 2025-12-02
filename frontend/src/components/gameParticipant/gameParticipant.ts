import './gameParticipant.css'
import type { Participant } from '../../models/models'

export class GameParticipant {
    private participant: Participant
    private version: number
    private element: HTMLElement

    /**
     * @param participant Datos del jugador
     * @param version Número del 1 al 5 para elegir la variante del personaje
     */
    constructor(participant: Participant, version: number) {
        this.participant = participant
        // Aseguramos que la versión esté entre 1 y 5 por seguridad
        this.version = Math.max(1, Math.min(version, 8))
        this.element = document.createElement('div')
    }

    render(): HTMLElement {
        // Asignamos clases base y dinámicas
        this.element.className = `game-participant-card version-${this.version}`

        if (this.participant.isBot) {
            this.element.classList.add('is-bot')
        }

        // Obtener la URL de la imagen (lógica separada)
        const imageUrl = this.getAvatarUrl()

        this.element.innerHTML = `
            <div class="gp-name-container">
                <span class="gp-name">${this.participant.nickname}</span>
            </div>
            
            <div class="gp-avatar-container">
                <img src="${imageUrl}" alt="${this.participant.nickname}" class="gp-avatar" />
            </div>
        `

        return this.element
    }


    private getAvatarUrl(): string {


        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
            const user = JSON.parse(userStr);
            const currentUserId = user.id;
            if (this.participant.userId === currentUserId && this.participant.characterId == 2) {
                 return `/src/assets/charactersInGame/char_l_${this.version}.png`
            }

        }


        //  Usamos una de las 5 versiones del personaje.
        // Asume que tienes las imágenes en /public/assets/characters/ o importadas.
        // Ajusta esta ruta al nombre real de tus archivos.
        // Ejemplo: character_1.png, character_2.png...

        // NOTA: Si usas Vite y las imágenes están en 'public', usa la ruta absoluta:
        return `/src/assets/charactersInGame/char_w_${this.version}.png`

        // Si quieres usar las imágenes que ya tienes en el proyecto como placeholders:
        // const variants = ['villager', 'seer', 'witch', 'hunter', 'werewolf'];
        // return `/src/assets/characters/${variants[this.version - 1]}.png`; 
    }
}