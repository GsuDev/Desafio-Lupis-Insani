import './gameParticipant.css'
import type { Participant } from '../../models/models'
import sprite from '../../assets/charactersInGame/char_l_3.png'

export class GameParticipant {
    private participant: Participant
    private version: number
    private element: HTMLElement
    private voteCount: number = 0
    private voteBadge: HTMLElement | null = null
    private isVotingEnabled: boolean = false
    private isVotedByMe: boolean = false
    private onVoteCallback: ((participantId: number) => void) | null = null
    private isDead: boolean = false

    /**
     * @param participant Datos del jugador
     * @param version Número del 1 al 8 para elegir la variante del personaje
     */
    constructor(participant: Participant, version: number) {
        this.participant = participant
        this.version = Math.max(1, Math.min(version, 8))
        this.element = document.createElement('div')
    }

    render(): HTMLElement {
        this.element.className = `game-participant-card version-${this.version}`

        if (this.participant.isBot) {
            this.element.classList.add('is-bot')
        }

        const imageUrl = this.getAvatarUrl()

        this.element.innerHTML = `
            <div class="gp-name-container ${this.isVotedByMe ? 'voted-by-me' : ''}">
                <span class="gp-name">${this.participant.nickname}</span>
            </div>
            
            <div class="gp-avatar-container">
                <img src="${imageUrl}" alt="${this.participant.nickname}" class="gp-avatar" />
            </div>
        `

        // Añadir badge de votos (inicialmente oculto)
        this.voteBadge = document.createElement('div')
        this.voteBadge.className = 'gp-vote-badge hidden'
        this.voteBadge.textContent = '0'
        this.element.appendChild(this.voteBadge)

        // Añadir evento de click
        this.element.addEventListener('click', () => this.handleClick())

        // Verificar estado inicial
        this.updateDeadStatus()

        return this.element
    }

    private handleClick(): void {
        if (this.isDead) return

        if (!this.isVotingEnabled) return

        if (this.onVoteCallback) {
            this.onVoteCallback(this.participant.id)
        }
    }

    /**
     * Habilita o deshabilita la capacidad de votar
     */
    public setVotingEnabled(enabled: boolean): void {
        //los muertos no pueden votar ni recibir votos
        if (this.isDead) {
            this.isVotingEnabled = false
            this.element.classList.remove('votable')
            this.element.style.cursor = 'not-allowed'
            return
        }

        this.isVotingEnabled = enabled
        if (enabled) {
            this.element.classList.add('votable')
            this.element.style.cursor = 'pointer'
        } else {
            this.element.classList.remove('votable')
            this.element.style.cursor = 'default'
        }
    }

    /**
     * Establece el callback que se ejecutará al hacer click
     */
    public setOnVote(callback: (participantId: number) => void): void {
        this.onVoteCallback = callback
    }

    /**
     * Incrementa el contador de votos con animación
     */
    public incrementVote(): void {
        this.voteCount++
        this.updateVoteBadge()
        this.animateBounce()
    }

    /**
     * Decrementa el contador de votos
     */
    public decrementVote(): void {
        this.voteCount = Math.max(0, this.voteCount - 1)
        this.updateVoteBadge()
    }

    /**
     * Resetea el contador de votos
     */
    public resetVotes(): void {
        this.voteCount = 0
        this.updateVoteBadge()
        if (this.voteBadge) {
            this.voteBadge.classList.add('hidden')
        }
    }

    /**
     * Marca visualmente que este participante ha sido votado por mí
     */
    public setVotedByMe(voted: boolean): void {
        this.isVotedByMe = voted
        const nameContainer = this.element.querySelector('.gp-name-container')
        if (nameContainer) {
            if (voted) {
                nameContainer.classList.add('voted-by-me')
            } else {
                nameContainer.classList.remove('voted-by-me')
            }
        }
    }

    /**
     * Actualiza el badge de votos
     */
    private updateVoteBadge(): void {
        if (!this.voteBadge) return

        this.voteBadge.textContent = this.voteCount.toString()

        if (this.voteCount > 0) {
            this.voteBadge.classList.remove('hidden')
        } else {
            this.voteBadge.classList.add('hidden')
        }
    }

    /**
     * Animación de bounce al recibir un voto
     */
    private animateBounce(): void {
        if (!this.voteBadge) return

        this.voteBadge.classList.remove('bounce-animation')
        // Force reflow
        void this.voteBadge.offsetWidth
        this.voteBadge.classList.add('bounce-animation')

        setTimeout(() => {
            this.voteBadge?.classList.remove('bounce-animation')
        }, 600)
    }

    /**
     * Obtiene el ID del participante
     */
    public getParticipantId(): number {
        return this.participant.id
    }

    /**
     * Fuerza el estado de muerte en el dato local y actualiza la vista
     * (Usado cuando llega un evento de muerte en tiempo real)
     */
    public setDead(): void {
        if (!this.participant.states) {
            this.participant.states = []
        }
        // Si no está ya marcado como muerto, lo marcamos
        if (!this.participant.states.includes('DEAD')) {
            this.participant.states.push('DEAD')
        }
        // Actualizamos la vista
        this.updateDeadStatus()
    }

     private checkIfDead():boolean{
        
        return this.participant.states?.includes('DEAD') || false
    }

    //actualiza el sprite del participante a fantasma si esta muerto
    public updateDeadStatus():void{
        const wasDead = this.isDead
        this.isDead = this.checkIfDead()

        if (this.isDead && !wasDead) {
            //transicion vivo -> muerto
            this.setDeadSprite()
            this.setVotingEnabled(false)
            this.element.classList.add('is-dead')
        }else if (!this.isDead && wasDead) {
            //transicion muerto vivo
            this.setAliveSprite()
            this.element.classList.remove('is-dead')
        }
    }

    // cambia sprite a fantasma
    private setDeadSprite():void{
        const avatarImg = this.element.querySelector('.gp-avatar') as HTMLImageElement
        if (avatarImg) {
            //aqui va el sprite del fantasma ///CAMBIAAAAAAAAAAAAAAAR SOLO PRUEBAAAA
            // avatarImg.src = sprite

            avatarImg.classList.add('ghost-sprite')
        }
    }

    //restaurar el sprite normal
    private setAliveSprite():void{
        const avatarImg = this.element.querySelector('.gp-avatar') as HTMLImageElement
        if (avatarImg) {
            const imageUrl = this.getAvatarUrl()
            avatarImg.src = imageUrl
            avatarImg.classList.remove('ghost-sprite')
        }
    }


    private getAvatarUrl(): string {
        const userStr = localStorage.getItem('currentUser')
        if (userStr) {
            const user = JSON.parse(userStr)
            const currentUserId = user.id
            if (
                this.participant.userId === currentUserId &&
                this.participant.characterId == 2
            ) {
                return `/src/assets/charactersInGame/char_l_${this.version}.png`
            }
        }
        return `/src/assets/charactersInGame/char_w_${this.version}.png`
    }

   
}
