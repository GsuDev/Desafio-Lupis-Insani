import './game.css'
import type { Game, Participant } from '../../models/models'
import { GameParticipant } from '../gameParticipant/gameParticipant'
import { GameChat } from '../gameChat/gameChat'
import { TimeBar } from '../timeBar/timeBar'
import { RoleCard, type PlayerRole } from '../roleCard/roleCard'
import { NarratorOverlay } from '../narratorOverlay/NarratorOverlay'
import { gameController } from '../../controllers/GameController'

import { emitGameEvent } from '../../providers/event.provider'
// Asegúrate de que las rutas coinciden con tu estructura
import AccessContainer from '../accessContainer/AccessContainer'
import UserProfileContainer from '../userProfileContainer/userProfileContainer'
import { DeathModalContainer } from '../deathModalContainer/deathModalContainer'
import { userController } from '../../controllers/UserController'
import { MayorElectedModal } from '../mayorElected/mayorElected'

/**
 * Clase GameComponent
 * Componente principal para visualizar la partida activa.
 */
export class GameComponent {
    private container: HTMLElement
    private participantsContainer: HTMLElement
    private chatContainer: HTMLElement
    private readonly WOLF_CHARACTER_ID = 2

    private timeBarContainer: HTMLElement
    private roleCardContainer: HTMLElement

    //Componente letras
    private campfireContainer: HTMLElement

    private narratorOverlay: NarratorOverlay
    //seguramente crezca en función de los elementos que necesite por ejemplo la carta, la barra de tiempo...
    // Estado de votación
    private static instance: GameComponent | null = null
    private isVotingActive: boolean = false
    private myCurrentVote: number | null = null
    private participantComponents: Map<number, GameParticipant> = new Map()

    // Estado del día/noche
    private currentPhase: 'day' | 'night' = 'day'
    private currentDayNumber: number = 1

    //Barra de tiempo
    private timeBar: TimeBar | null = null

    constructor() {
        this.container = this.createContainer()
        this.participantsContainer = this.createParticipantsContainer()
        this.chatContainer = this.createChatContainer()
        this.timeBarContainer = this.createTimeBarContainer()
        this.roleCardContainer = this.createRoleCardContainer()

        this.campfireContainer = this.createCampfireContainer()
        this.narratorOverlay = new NarratorOverlay(this.container)

        this.timeBar = new TimeBar(7) // el numero de phases que tengamos


        // Guardar instancia singleton
        GameComponent.instance = this

        //harcodeada
        GameComponent.instance.timeBar?.setPhase(1)
    }

    // ========== MÉTODOS ESTÁTICOS PARA VOTACIÓN ==========

    /**
     * Maneja el inicio del período de votación
     */
    public static handleVoteStart(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }
        GameComponent.instance.startVoting()
    }

    /**
     * Maneja el final del período de votación
     */
    public static handleVoteEnd(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }
        GameComponent.instance.endVoting()
    }

    /**
     * Maneja cuando se emite un voto
     */
    public static handleVoteEmitted(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }

        const targetId = data.targetId || data.target_id
        const voterId = data.voterId || data.voter_id

        if (!targetId || !voterId) {
            console.error('❌ Datos incompletos en vote.emitted:', data)
            return
        }

        // 🔥 IMPORTANTE: No procesar mi propio voto (ya se hizo optimistamente)
        const currentUserId = GameComponent.instance.getCurrentParticipantId()
        if (voterId === currentUserId) {
            console.log(
                'ℹ️ Ignorando mi propio voto (ya procesado optimistamente)'
            )
            return
        }

        GameComponent.instance.addVote(targetId, voterId)
    }

    private createCampfireContainer(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'campfire-image-container'

        const fireDiv = document.createElement('div')

        fireDiv.className = 'campfire-image'
        fireDiv.id = 'campfire-image'

        container.appendChild(fireDiv)
        return container
    }

    /**
     * Maneja cuando se cancela un voto
     */
    public static handleVoteCanceled(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }

        const targetId = data.targetId || data.target_id
        const voterId = data.voterId || data.voter_id

        if (!targetId || !voterId) {
            console.error('❌ Datos incompletos en vote canceled:', data)
            return
        }

        // 🔥 IMPORTANTE: No procesar mi propia cancelación (ya se hizo optimistamente)
        const currentUserId = GameComponent.instance.getCurrentParticipantId()
        if (voterId === currentUserId) {
            console.log(
                'ℹ️ Ignorando mi propia cancelación (ya procesada optimistamente)'
            )
            return
        }

        GameComponent.instance.removeVote(targetId, voterId)
    }

    /*
     * Maneja el resultado de la votación
     */
    public static handleVoteResult(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }

        GameComponent.instance.endVoting() // Finalizar votación
        // TODO: SERGIO HU futura: Marcar a los muertos como muertos
        const victim =
            data.participantId ||
            data.participant_id ||
            data.targetId ||
            data.target_id

        const dead = data.dead
        if (victim && victim.id && dead) {
            // Marcamos al muerto usando su ID real
            GameComponent.markParticipantAsDead(victim.id)
        }
        if (victim && victim.id && !dead) {
            GameComponent.markParticipantAsMayor(victim.id)
        }

        // Actualizamos estado general por si acaso
        GameComponent.updateParticipantsDeadStatus()
    }

    // ========== MÉTODOS ESTÁTICOS PARA DÍA/NOCHE ==========

    /**
     * Maneja el evento de día
     */
    public static handleDayPhase(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }

        const dayNumber = data.dayNumber || data.day_number || data.day || 1
        console.log(`☀️ Fase de DÍA iniciada - Día ${dayNumber}`)

        GameComponent.instance.currentPhase = 'day'
        GameComponent.instance.currentDayNumber = dayNumber
        const gameContainer = document.getElementById('game-component')
        if (gameContainer) {
            gameContainer.classList.remove('phase-night') // 👈 Quita noche
            gameContainer.classList.add('phase-day') // 👈 Añade día
        }
        const campfireImg = document.getElementById('campfire-image')
        if (campfireImg) {
            campfireImg.classList.remove('phase-night')
        }

        GameComponent.instance.hideWolves()
    }
    private hideWolves(): void {
        this.participantComponents.forEach((component) => {
            component.hideAsVillager()
        })
    }

    /**
     * Maneja el evento de noche
     */
    public static handleNightPhase(data: any): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }

        const dayNumber = data.dayNumber || data.day_number || data.day || 1
        console.log(`🌙 Fase de NOCHE iniciada - Día ${dayNumber}`)

        GameComponent.instance.currentPhase = 'night'
        GameComponent.instance.currentDayNumber = dayNumber
        const gameContainer = document.getElementById('game-component')
        if (gameContainer) {
            gameContainer.classList.remove('phase-day') // 👈 Quita día
            gameContainer.classList.add('phase-night') // 👈 Añade noche
        }
        const campfireImg = document.getElementById('campfire-image')
        if (campfireImg) {
            campfireImg.classList.add('phase-night')
        }
        if (GameComponent.instance.isCurrentParticipantWolf()) {
            GameComponent.instance.revealWolves()
        }
    }

    private isCurrentParticipantWolf(): boolean {
        const myRole = this.getMyRole()
        return myRole === 'wolf'
    }

    private isThisParticipantWolf(participantId: number): boolean {
        const participant = gameController.currentGame?.participants.find(
            (p) => p.id === participantId
        )
        if (!participant) return false
        return participant.characterId === this.WOLF_CHARACTER_ID
    }
    private static checkIfDead(): boolean {
        return (
            GameComponent.instance!.getCurrentParticipant()!.states!.includes(
                'DEAD'
            ) || false
        )
    }

    private revealWolves(): void {
        this.participantComponents.forEach((component) => {
            const participantId = component.getParticipantId()
            const isWolf = this.isThisParticipantWolf(participantId)
            if (isWolf) {
                component.revealAsWolf()
            }
        })
    }
    // ========== MÉTODOS ESTÁTICOS PARA PLAYER EVENTS ==========

    /**
     * Actualiza los sprites de todos los participantes según sus states
     */
    /**
     * Busca un participante por ID y lo marca como muerto inmediatamente
     * (Esto se ejecuta en tiempo real cuando llega el evento del socket)
     */
    public static markParticipantAsDead(participantId: number): void {
        if (!GameComponent.instance) return

        console.log(`💀 Marcando como muerto al ID: ${participantId}`)
        const component =
            GameComponent.instance.participantComponents.get(participantId)

        if (component) {
            component.setDead()
        }

        const myId = GameComponent.instance.getCurrentParticipantId()
        if (myId === participantId) {
            console.log('⚰️ ¡He muerto yo! Mostrando modal...')

            setTimeout(() => {
                GameComponent.instance?.showDeathModal()
            }, 1000)
        }
    }
    /**
     * Busca un participante por ID y lo marca como muerto inmediatamente
     * (Esto se ejecuta en tiempo real cuando llega el evento del socket)
     */
    public static markParticipantAsMayor(participantId: number): void {
        if (!GameComponent.instance) return

        console.log(`👑 Marcando como alcalde al ID: ${participantId}`)

        const component =
            GameComponent.instance.participantComponents.get(participantId)

        if (component) {
            component.setMayor()
        }

        const myId = GameComponent.instance.getCurrentParticipantId()
        if (myId === participantId) {
            console.log('👑 ¡He sido elegido como alcalde! Mostrando modal...')

            setTimeout(() => {
                // cuando el jugador sea elegido alcalde:
                const modal = new MayorElectedModal()
                modal.show()
                // TODO: Implementar modal de alcalde
                // GameComponent.instance?.showMayorModal()
            }, 1000)
        }
    }

    public static updateParticipantsDeadStatus(): void {
        if (!GameComponent.instance) {
            console.warn('⚠️ No hay instancia de GameComponent')
            return
        }

        console.log('💀 Actualizando estados de vida/muerte de participantes')
        GameComponent.instance.refreshParticipantsDeadStatus()
    }

    /**
     * Refresca el estado de vida/muerte de todos los participantes renderizados
     */
    private refreshParticipantsDeadStatus(): void {
        this.participantComponents.forEach((component) => {
            component.updateDeadStatus()
        })
    }

    // ========== MÉTODOS DE INSTANCIA PARA VOTACIÓN ==========

    /**
     * Inicia el período de votación
     */
    private startVoting(): void {
        console.log('🗳️ Período de votación iniciado')
        this.isVotingActive = true
        this.myCurrentVote = null

        // Habilitar votación en todos los participantes
        this.participantComponents.forEach((component) => {
            component.setVotingEnabled(true)
            component.resetVotes()
        })
    }

    /**
     * Añade un voto a un participante
     */
    private addVote(targetId: number, voterId: number): void {
        console.log(`✅ Voto añadido: ${voterId} -> ${targetId}`)

        const component = this.participantComponents.get(targetId)
        if (component) {
            component.incrementVote()
        }

        // Si soy yo quien votó, marcar visualmente
        const currentUserId = this.getCurrentParticipantId()
        if (voterId === currentUserId) {
            this.markMyVote(targetId)
            this.myCurrentVote = targetId
        }
    }

    /**
     * Remueve un voto de un participante
     */
    private removeVote(targetId: number, voterId: number): void {
        console.log(`❌ Voto eliminado: ${voterId} -> ${targetId}`)

        const component = this.participantComponents.get(targetId)
        if (component) {
            component.decrementVote()
        }

        // Si soy yo quien canceló, quitar marca visual
        const currentUserId = this.getCurrentParticipantId()
        if (voterId === currentUserId) {
            component?.setVotedByMe(false)
            this.myCurrentVote = null
        }
    }

    /**
     * Finaliza el período de votación
     */
    private endVoting(): void {
        console.log('📊 Resultado de votación recibido')
        // TODO HU futura: Mostrar quién fue eliminado

        // Resetear estado de votación
        this.isVotingActive = false
        this.myCurrentVote = null

        this.participantComponents.forEach((component) => {
            component.setVotingEnabled(false)
            component.resetVotes()
            component.setVotedByMe(false)
        })
    }

    /**
     * Maneja el click en un participante para votar
     * Con actualización optimista del UI
     */
    private handleParticipantVote(participantId: number): void {
        if (!this.isVotingActive) {
            console.warn('⚠️ No hay votación activa')
            return
        }

        const gameStr = localStorage.getItem('currentGame')
        if (!gameStr) return

        const game = JSON.parse(gameStr)
        const gameId = game.id

        const isDay = this.currentPhase === 'day'
        const currentUserId = this.getCurrentParticipantId()
        if (!currentUserId) return
        const instance = GameComponent.instance
        if (!instance) return
        if (GameComponent.checkIfDead()) {
            console.warn('⚠️ No puedes votar si estás muerto')
            return
        }

        // 🔥 VALIDACIÓN: No puedes votarte a ti mismo
        if (participantId === currentUserId) {
            console.warn('⚠️ No puedes votarte a ti mismo')
            return
        }
        // 🔥 VALIDACIÓN: No puedes votarte a ti mismo
        if (
            this.currentPhase === 'night' &&
            this.isThisParticipantWolf(participantId) &&
            this.isThisParticipantWolf(currentUserId)
        ) {
            console.warn('⚠️ No puedes votar a otros lobos de noche')
            return
        }

        // 🔥 ACTUALIZACIÓN OPTIMISTA DEL UI (antes de enviar al backend)

        // Caso 1: Ya tengo un voto activo
        if (this.myCurrentVote !== null) {
            const previousTarget = this.myCurrentVote

            // Caso 1A: Click en el mismo → Cancelar voto
            if (this.myCurrentVote === participantId) {
                console.log(`🗳️ Cancelando voto a ${participantId} (optimista)`)
                this.removeVote(participantId, currentUserId)

                emitGameEvent(gameId, 'vote.emitted', {
                    targetId: participantId,
                    isDay: isDay,
                    dayNumber: this.currentDayNumber,
                })
                return
            }

            // Caso 1B: Click en otro → Cambiar voto
            console.log(
                `🗳️ Cambiando voto de ${previousTarget} a ${participantId} (optimista)`
            )
            this.removeVote(previousTarget, currentUserId)
            this.addVote(participantId, currentUserId)

            emitGameEvent(gameId, 'vote.emitted', {
                targetId: participantId,
                isDay: isDay,
                dayNumber: this.currentDayNumber,
            })
            return
        }

        // Caso 2: No tengo voto activo → Nuevo voto
        console.log(`🗳️ Nuevo voto a ${participantId} (optimista)`)
        this.addVote(participantId, currentUserId)

        emitGameEvent(gameId, 'vote.emitted', {
            targetId: participantId,
            isDay: isDay,
            dayNumber: this.currentDayNumber,
        })
    }

    /**
     * Marca visualmente a quién he votado
     */
    private markMyVote(targetId: number): void {
        // Quitar marca de todos
        this.participantComponents.forEach((component) => {
            component.setVotedByMe(false)
        })

        // Marcar el nuevo
        const component = this.participantComponents.get(targetId)
        if (component) {
            component.setVotedByMe(true)
        }
    }

    /**
     * Obtiene el ID del usuario actual (HACER PÚBLICO)
     */
    public getCurrentParticipantId(): number | null {
        try {
            const cUser = userController.currentUser
            if (!cUser) {
                console.log('no existe usuario')
                return null
            }
            const participant = gameController.currentGame?.participants.find(
                (p) => p.nickname === cUser.nickname
            )
            if (!participant) return null

            return participant.id
        } catch {
            return null
        }
    }
    /**
     * Obtiene el ID del usuario actual (HACER PÚBLICO)
     */
    public getCurrentParticipant(): Participant | null {
        try {
            const cUser = userController.currentUser
            if (!cUser) {
                console.log('no existe usuario')
                return null
            }
            const participant = gameController.currentGame?.participants.find(
                (p) => p.nickname === cUser.nickname
            )
            if (!participant) return null

            return participant
        } catch {
            return null
        }
    }

    // ========== MÉTODOS DE CREACIÓN DE CONTENEDORES ==========

    private createContainer(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'game-component'
        container.id = 'game-component'
        return container
    }

    private createTimeBarContainer(): HTMLElement {
        const wrapper = document.createElement('div')
        wrapper.className = 'game-time-bar-wrapper' // Usamos la clase del CSS nuevo

        // Insertamos el elemento real del componente TimeBar
        if (this.timeBar) {
            wrapper.appendChild(this.timeBar.getElement())
        }

        return wrapper
    }

    private createRoleCardContainer(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-role-card-wrapper'
        div.style.zIndex = '60'
        return div
    }

    private createParticipantsContainer(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-participants-grid'
        return div
    }

    private createChatContainer(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-chat-wrapper'
        return div
    }

    // ========== MÉTODOS DE RENDERIZADO ==========

    public render(): HTMLElement {
        //Renderizo la hoguera
        this.container.appendChild(this.campfireContainer)

        this.container.appendChild(this.participantsContainer)

        this.container.appendChild(this.timeBarContainer)
        this.container.appendChild(this.chatContainer)
        this.container.appendChild(this.roleCardContainer)

        this.addExitButton()

        const isWolf = this.checkIfPlayerIsWolf()
        const gameChat = new GameChat(this.chatContainer, isWolf)
        gameChat.render()

        // const timeBar = new TimeBar(this.timeBarContainer)
        // timeBar.render()

        const myRole = this.getMyRole()
        const roleCard = new RoleCard(this.roleCardContainer, myRole)
        roleCard.render()

        this.container.appendChild(this.createTimeBarContainer())

        return this.container
    }

    private getMyRole(): PlayerRole {
        try {
            const userStr = localStorage.getItem('currentUser')
            if (!userStr) return 'villager'

            const user = JSON.parse(userStr)
            const gameStr = localStorage.getItem('currentGame')
            if (!gameStr) return 'villager'

            const game = JSON.parse(gameStr)
            const participants = game.participants || []

            const myParticipant = participants.find(
                (p: any) => p.userId === user.id
            )

            if (!myParticipant || !myParticipant.characterId) return 'villager'

            const characterId = parseInt(myParticipant.characterId)

            if (characterId === this.WOLF_CHARACTER_ID) return 'wolf'
            if (characterId === 1) return 'villager'
            if (characterId === 3) return 'seer'
            if (characterId === 4) return 'hunter'

            return 'villager'
        } catch (e) {
            console.error(e)
            return 'villager'
        }
    }

    public static onStateChange(newState: string) {
        if (!GameComponent.instance) return
        if (!GameComponent.instance.timeBar) {
            return
        }
        switch (newState) {
            case 'DAY_START':
                GameComponent.instance.timeBar.reset(); // Reinicia al empezar el día
                setTimeout(() => GameComponent.instance?.timeBar?.setPhase(1), 50);
                break;
            case 'DAY_DISCUSSION':
                GameComponent.instance.timeBar.setPhase(2);
                break;
            case 'DAY_VOTING':
                GameComponent.instance.timeBar.setPhase(3);
                break;
            case 'DAY_RESULT':
                GameComponent.instance.timeBar.setPhase(4);
                break;
            case 'NIGHT_START':
                GameComponent.instance.timeBar.setPhase(5);
                break;
            case 'NIGHT_DISCUSSION':
                GameComponent.instance.timeBar.setPhase(6);
                break;
            case 'NIGHT_VOTING':
                GameComponent.instance.timeBar.setPhase(7);
                break;
            // case 'VOTING':
            //     GameComponent.instance.timeBar.setPhase(2);
            //     break;

        }
        // switch (newState) {
        //     case 'DAY_DISCUSSION':
        //         this.timeBar?.reset(); // Reinicia al empezar el día
        //         setTimeout(() => this.timeBar?.setPhase(1), 50);
        //         break;
        //     case 'VOTING':
        //         this.timeBar?.setPhase(2);
        //         break;
        //     case 'NIGHT':
        //         GameComponent.instance.timeBar.setPhase(3);
        //         break;
        // }


    }

    private checkIfPlayerIsWolf(): boolean {
        try {
            const userStr = localStorage.getItem('currentUser')
            if (!userStr) return false

            const user = JSON.parse(userStr)
            const currentUserId = user.id

            const gameStr = localStorage.getItem('currentGame')
            if (!gameStr) return false

            const game = JSON.parse(gameStr)
            const participants = game.participants || []

            const myParticipant = participants.find(
                (p: any) => p.userId === currentUserId
            )

            if (!myParticipant || !myParticipant.characterId) {
                return false
            }

            return (
                this.WOLF_CHARACTER_ID === parseInt(myParticipant.characterId)
            )
        } catch (error) {
            console.error('Error verificando rol de lobo:', error)
            return false
        }
    }

    public update(game: Game, participants: Participant[]): void {
        this.participantsContainer.innerHTML = ''
        this.participantComponents.clear()

        const MAX_INNER = 10

        const innerCircleParticipants = participants.slice(0, MAX_INNER)
        const outerCircleParticipants = participants.slice(
            MAX_INNER,
            MAX_INNER + 20
        )

        const width = window.innerWidth
        const height = window.innerHeight
        const minDim = Math.min(width, height)

        const r1 = minDim * 0.1
        const r2 = minDim * 0.18

        this.renderCircle(innerCircleParticipants, r1, width / 2, height / 2)
        this.renderCircle(outerCircleParticipants, r2, width / 2, height / 2)
    }

    private renderCircle(
        list: Participant[],
        radius: number,
        centerX: number,
        centerY: number
    ) {
        if (list.length === 0) return

        const angleStep = (2 * Math.PI) / list.length

        const CAMPFIRE_Z_INDEX = 10

        list.forEach((p, index) => {
            const angle = index * angleStep - Math.PI / 2

            let x = centerX + radius * Math.cos(angle)
            let y = centerY + radius * Math.sin(angle)
            const width = window.innerWidth
            const height = window.innerHeight
            const midWidth = width / 2
            const midHeight = height / 2

            if (x > midWidth) {
                x += (x - midWidth) * 1.1
            } else {
                x -= (midWidth - x) * 1 - 1
            }

            if (y > midHeight) {
                y -= (y - midHeight) * 0.1
            } else {
                y += (midHeight - y) * 0.1
            }

            const percentageX = (x / width) * 100
            const percentageY = (y / height) * 100

            let angleDeg = angle * (180 / Math.PI)
            const versionIndex = this.getPoseImage(angleDeg)

            const pComponent = new GameParticipant(p, versionIndex)
            const pElement = pComponent.render()

            //Logica de profundidad
            const is_behind = y < midHeight
            pElement.style.zIndex = is_behind
                ? (CAMPFIRE_Z_INDEX - 1).toString()
                : (CAMPFIRE_Z_INDEX + 1).toString()

            // Configurar callback de voto
            pComponent.setOnVote((participantId) =>
                this.handleParticipantVote(participantId)
            )

            // Si hay votación activa, habilitar
            if (this.isVotingActive) {
                pComponent.setVotingEnabled(true)
            }

            pElement.style.left = `${percentageX}%`
            pElement.style.top = `${percentageY}%`

            this.participantsContainer.appendChild(pElement)

            // Guardar referencia
            this.participantComponents.set(p.id, pComponent)
        })
    }

    private getPoseImage(angle: number): number {
        const normalizedAngle = angle + 90
        const poses = [1, 8, 7, 6, 5, 4, 3, 2] as const
        const index = Math.round(normalizedAngle / 45) % 8
        return poses[index]
    }

    // ========== MÉTODOS DE SALIDA DE PARTIDA ==========

    /**
     * Añade el botón de salir de la partida
     */
    private addExitButton(): void {
        const exitButton = document.createElement('button')
        exitButton.className = 'game-exit-button'
        exitButton.innerHTML = 'Salir'
        exitButton.addEventListener('click', () => this.showExitModal())

        this.container.appendChild(exitButton)
    }

    /**
     * Muestra el modal de confirmación de salida
     */
    private showExitModal(): void {
        const modal = document.createElement('div')
        modal.className = 'exit-modal-overlay'

        const userStr = localStorage.getItem('currentUser')
        const isAnonymous = !userStr || JSON.parse(userStr).isAnonymous

        modal.innerHTML = `
            <div class="exit-modal">
                <h2>¿Salir de la partida?</h2>
                <p>Si sales, quedarás marcado como muerto y no podrás volver.</p>
                
                <div class="exit-modal-buttons">
                    <button class="btn-cancel">Cancelar</button>
                    <button class="btn-exit-title">Salir al Título</button>
                    ${!isAnonymous ? '<button class="btn-exit-profile">Ir a mi Perfil</button>' : ''}
                </div>
            </div>
        `

        modal.querySelector('.btn-cancel')?.addEventListener('click', () => {
            modal.remove()
        })

        modal
            .querySelector('.btn-exit-title')
            ?.addEventListener('click', () => {
                this.exitGame('title')
            })

        modal
            .querySelector('.btn-exit-profile')
            ?.addEventListener('click', () => {
                this.exitGame('profile')
            })

        document.body.appendChild(modal)
    }

    /**
     * Muestra el modal de muerte cuando el jugador pierde
     */
    private showDeathModal(): void {
        const app = document.getElementById('app')
        if (!app) return

        // 1. Definimos qué pasa al pulsar "Seguir Viendo"
        const onSpectate = () => {
            // Solo quitamos el modal
            const modal = document.querySelector('.death-modal-container')
            if (modal) modal.remove()
            document.body.classList.remove('death-modal-active')
        }

        // 2. Definimos qué pasa al pulsar "Salir"
        const onExitTitle = () => this.exitGame('title')
        const onExitProfile = () => this.exitGame('profile')

        // 3. Creamos y mostramos el modal (lo enchufamos al body para tapar todo)
        const deathModal = new DeathModalContainer(
            document.body, // Root node
            onSpectate,
            onExitTitle,
            onExitProfile
        )

        deathModal.render()
    }

    /**
     * Envía el evento player.left, desconecta sockets y cambia de pantalla
     */
    private async exitGame(target: 'title' | 'profile'): Promise<void> {
        // 1. Limpiamos el modal de SALIR (tu código original)
        const modal = document.querySelector('.exit-modal-overlay')
        if (modal) {
            modal.remove()
        }

        // 👇 AÑADIR ESTO: Limpiamos también el modal de MUERTE si está abierto
        const deathModal = document.querySelector('.death-modal-container')
        if (deathModal) {
            deathModal.remove()
        }
        // 👇 AÑADIR ESTO: Limpiamos las clases del body
        document.body.classList.remove('death-modal-active')
        document.body.classList.remove('game-over-active')

        try {
            const gameStr = localStorage.getItem('currentGame')

            if (gameStr) {
                const game = JSON.parse(gameStr)

                // Respetamos TU método: getCurrentParticipantId()
                await emitGameEvent(game.id, 'player.left', {
                    participantId: this.getCurrentParticipantId(),
                })
                console.log('✅ Evento player.left enviado')
            }
        } catch (error) {
            console.error('Error al salir de la partida:', error)
        }

        gameController.disconnectGameChannel()
        gameController.disconnectWolvesChannel()

        const app = document.getElementById('app')
        if (!app) {
            console.error('❌ No se encontró el contenedor #app')
            return
        }

        app.innerHTML = ''

        if (target === 'title') {
            const access = new AccessContainer(app)
            access.render()
        } else {
            const profile = new UserProfileContainer(app)
            profile.render()
        }
    }
}
