import './timeBar.css'

export class TimeBar {
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    render(): void {
        const barWrapper = document.createElement('div')
        barWrapper.className = 'time-bar-wrapper'

        // indicar el dia
        const dayIndicator = document.createElement('div')
        dayIndicator.className = 'phase-indicator'
        dayIndicator.innerHTML = `
            <span class="icon-glow">☀️</span>
            <span class="phase-text day-text">Día</span>
        `

        // barra central
        const progressTrack = document.createElement('div')
        progressTrack.className = 'progress-track'
        progressTrack.innerHTML = `
            <div class="progress-fill"></div>
            <div class="progress-text-overlay">TIEMPO DE FASE</div>
        `

        // indicador de noche
        const nightIndicator = document.createElement('div')
        nightIndicator.className = 'phase-indicator'
        nightIndicator.innerHTML = `
            <span class="phase-text night-text">Noche</span>
            <span class="icon-glow">🌙</span>
        `

        barWrapper.appendChild(dayIndicator)
        barWrapper.appendChild(progressTrack)
        barWrapper.appendChild(nightIndicator)

        this.container.appendChild(barWrapper)
    }
}

export default TimeBar
