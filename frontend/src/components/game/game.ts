import './game.css'
import type { Game, Participant } from '../../models/models'

/**
 * Clase GameComponent
 * Componente principal para visualizar la partida activa.
 * Recibe datos del juego y de los participantes para renderizar el estado actual.
 */

export class GameComponent{
    private container:HTMLElement
    private header: HTMLElement
    private statusDisplay: HTMLElement
    private participantsContainer : HTMLElement

    //seguramente crezca en función de los elementos que necesite por ejemplo la carta, la barra de tiempo...
    constructor(){
        this.container = this.createContainer()
        this.header = this.createHeader()
        this.statusDisplay = this.createStatusDisplay()
        this.participantsContainer = this.createParticipantsContainer()
    }

    /**
     * Crea el contenedor principal del componente
     */
    private createContainer(): HTMLElement {
        const container = document.createElement('div')
        container.className = 'game-component'
        return container
    }

    /**
     * Crea el encabezado, TODO: Luego lo cambio al ID de la partida
     */
    private createHeader(): HTMLElement {
        const header = document.createElement('header')
        header.className = 'game-header'
        header.innerHTML = '<h2>Partida en curso</h2>'
        return header
    }

    /**
     * Crea un elemento para mostrar el estado del juego (ej. "Día", "Noche", "Votación") es la barra superior de la pantalla
     */
    private createStatusDisplay(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-status'
        div.textContent = 'Estado: Cargando...'
        return div
    }


    /**
     * Crea el contenedor donde se mostrarán los participantes (o sus avatares en el juego) ¿cambiarlo a un componente ? 
     */
    private createParticipantsContainer(): HTMLElement {
        const div = document.createElement('div')
        div.className = 'game-participants-grid'
        return div
    }

    /**
     * Método público para renderizar el componente por primera vez.
     * Devuelve el HTMLElement listo para ser insertado en el DOM principal.
     */
    public render(): HTMLElement {
        this.container.appendChild(this.header)
        this.container.appendChild(this.statusDisplay)
        this.container.appendChild(this.participantsContainer)
        return this.container
    }

    /**
     * Actualiza la interfaz con los datos más recientes del juego y participantes.
     * @param game Datos actuales del objeto Game
     * @param participants Lista de participantes actualizada
     */
    public update(game: Game, participants: Participant[]): void {
        // 1. Actualizar estado del juego
        this.statusDisplay.textContent = `Estado: ${game.state}`

        // 2. Actualizar participantes
        // Nota: Aquí podría ser más sofisticado y no borrar todo cada vez,
        // pero para empezar, limpiar y redibujar es funcional.
        this.participantsContainer.innerHTML = ''
        
        participants.forEach(p => {
            const pElement = document.createElement('div')
            pElement.className = `participant-card ${p.isBot ? 'is-bot' : ''}`
            
            // Ejemplo de contenido: Avatar, Nickname y Rol (si es visible)
            pElement.innerHTML = `
                <div class="participant-avatar">
                    ${p.profileUrl ? `<img src="${p.profileUrl}" alt="${p.nickname}" />` : '👤'}
                </div>
                <div class="participant-info">
                    <span class="nickname">${p.nickname}</span>
                   }
                </div>
            `
            this.participantsContainer.appendChild(pElement)
        })
    }

}