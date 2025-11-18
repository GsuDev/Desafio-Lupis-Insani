import './participantList.css';
import type { Participant } from '../../models/Participant'
import { participantController } from '../../controllers/participantController'

/**
 * Clase ParticipantList
 * Maneja la lista de participantes (jugadores y bots) en la sala de espera
 */
export class ParticipantList {
    private container: HTMLElement;
    private header: HTMLElement;
    private list: HTMLElement;
    private footer: HTMLElement;
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
        return container;
    }

    private createHeader(): HTMLElement {
        const header = document.createElement('header')
        header.className = 'participant-list-header'
        header.id = 'participant-count-header'
        header.textContent = 'Cargando...'
        return header;
    }

    private createList(): HTMLElement {
        const list = document.createElement('div')
        list.className = 'participant-list-body'
        list.id = 'participant-list-body'
        return list;
    }

    private createButton(): HTMLButtonElement {
        this.footer.className = 'participant-list-footer'

        const btnIniciar = document.createElement('button')
        btnIniciar.className = 'btn-iniciar'
        btnIniciar.id = 'start-game-button'
        btnIniciar.textContent = 'Iniciar'
        btnIniciar.disabled = true;

        this.footer.appendChild(btnIniciar)

        return btnIniciar
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
        this.btnIniciar.disabled = isDisabled;
        this.btnIniciar.textContent = isDisabled ? 'Cargando...' : 'Iniciar'
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