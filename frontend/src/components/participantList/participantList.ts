import './participantList.css'
import { participantController } from '../../controllers/ParticipantController'
import type { Participant } from '../../models/models'

/**
 * Clase ParticipantList
 * Maneja la lista de participantes (jugadores y bots) en la sala de espera
 */
export class ParticipantList {
    private container: HTMLElement
    private header: HTMLElement
    private list: HTMLElement
    private footer: HTMLElement
    private btnIniciar: HTMLButtonElement

    constructor() {
        this.container = this.createContainer()
        this.header = this.createHeader()
        this.list = this.createList()
        this.footer = document.createElement('footer')
        this.btnIniciar = this.createButton()
    }

    private createContainer(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'participant-list'
        return container
    }

    private createHeader(): HTMLElement {
        const header = document.createElement('header')
        header.className = 'participant-list-header'
        header.id = 'participant-count-header'
        header.textContent = 'Cargando...'
        return header
    }

    private createList(): HTMLElement {
        const list = document.createElement('div')
        list.className = 'participant-list-body'
        list.id = 'participant-list-body'
        return list
    }

    private createButton(): HTMLButtonElement {
        this.footer.className = 'participant-list-footer'

        const btnIniciar = document.createElement('button')
        btnIniciar.className = 'btn-iniciar'
        btnIniciar.id = 'start-game-button'
        btnIniciar.textContent = 'Iniciar'
        // btnIniciar.style.display = 'none'
        btnIniciar.disabled = true

        this.footer.appendChild(btnIniciar)

        return btnIniciar
    }

    setLoading(isLoading: boolean): void {
        if (isLoading) {
            // Guardamos el ancho original para que el botón no "baile" al cambiar texto
            const width = this.btnIniciar.offsetWidth
            this.btnIniciar.style.width = `${width}px`

            this.btnIniciar.textContent = 'CARGANDO...'
            this.btnIniciar.disabled = true
            this.btnIniciar.style.cursor = 'wait'
            this.btnIniciar.classList.add('btn-loading') // Por si queremos estilos extra luego
        } else {
            this.btnIniciar.textContent = 'INICIAR'
            this.btnIniciar.style.width = ''
            this.btnIniciar.style.cursor = 'pointer'
            this.btnIniciar.classList.remove('btn-loading')
            // Nota: El controlador decidirá luego si debe seguir disabled o no según si es Host
        }
    }

    /**
     * Actualiza la lista de participantes
     */
    updateParticipants(participants: Participant[]): void {
        this.header.textContent = `${participants.length}/15 Jugadores`
        participantController.renderParticipantList(participants, this.list)
    }

    /**
     * Habilita o deshabilita el botón de iniciar
     */
    disableButton(isDisabled: boolean): void {
        this.btnIniciar.disabled = isDisabled
    }

    /**
     * Renderiza el componente y devuelve el elemento HTML
     */
    render(): HTMLElement {
        // ✅ Orden correcto: header → list → footer
        this.container.appendChild(this.header)
        this.container.appendChild(this.list)
        this.container.appendChild(this.footer)

        return this.container
    }
}
