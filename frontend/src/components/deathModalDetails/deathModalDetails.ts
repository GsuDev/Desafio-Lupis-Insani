import './deathModalDetails.css'
import logo from '../../assets/icons/lupis-insani.png'

export class DeathModalDetails {
    private container: HTMLElement

    // Funciones que ejecutaremos cuando el usuario pulse los botones
    private onSpectate: () => void
    private onExitTitle: () => void
    private onExitProfile: () => void

    constructor(
        onSpectate: () => void,
        onExitTitle: () => void,
        onExitProfile: () => void
    ) {
        this.onSpectate = onSpectate
        this.onExitTitle = onExitTitle
        this.onExitProfile = onExitProfile

        this.container = document.createElement('div')
        this.container.classList.add('death-modal-details')
    }

    public render(): HTMLElement {
        this.container.innerHTML = ''

        this.renderLogo()
        this.renderTitle()
        this.renderMessage()
        this.renderButtons()

        return this.container
    }

    private renderLogo(): void {
        const logoContainer = document.createElement('div')
        logoContainer.classList.add('death-modal-logo-container')

        const img = document.createElement('img')
        img.src = logo
        img.alt = 'Skull'
        img.classList.add('death-modal-logo')

        logoContainer.appendChild(img)
        this.container.appendChild(logoContainer)
    }

    private renderTitle(): void {
        const title = document.createElement('h1')
        title.classList.add('death-modal-title')
        title.textContent = '💀 ¡HAS MUERTO! 💀'
        this.container.appendChild(title)
    }

    private renderMessage(): void {
        const p = document.createElement('p')
        p.classList.add('death-modal-message')
        p.textContent =
            'Tu aventura ha terminado... por ahora. ¿Qué deseas hacer?'
        this.container.appendChild(p)
    }

    private renderButtons(): void {
        const buttonGroup = document.createElement('div')
        buttonGroup.classList.add('death-modal-buttons')

        // 1. Botón Espectador (Verde o Azul - Algo positivo)
        const btnSpectate = document.createElement('button')
        btnSpectate.textContent = '👀 Seguir Viendo'
        btnSpectate.className = 'btn btn-spectate'
        btnSpectate.onclick = () => this.onSpectate()

        // 2. Botón Título (Naranja - Acción principal)
        const btnTitle = document.createElement('button')
        btnTitle.textContent = '🏠 Salir al Título'
        btnTitle.className = 'btn btn-title'
        btnTitle.onclick = () => this.onExitTitle()

        // Añadimos al grupo
        buttonGroup.appendChild(btnSpectate)
        buttonGroup.appendChild(btnTitle)

        // 3. Botón Perfil (Solo si NO es anónimo)
        if (this.canShowProfile()) {
            const btnProfile = document.createElement('button')
            btnProfile.textContent = '👤 Ir a mi Perfil'
            btnProfile.className = 'btn btn-profile'
            btnProfile.onclick = () => this.onExitProfile()

            buttonGroup.appendChild(btnProfile)
        }

        this.container.appendChild(buttonGroup)
    }

    /**
     * Verifica si el usuario puede ir al perfil (no es anónimo)
     */
    private canShowProfile(): boolean {
        try {
            const userStr = localStorage.getItem('currentUser')
            if (!userStr) return false
            const user = JSON.parse(userStr)
            return !user.isAnonymous
        } catch {
            return false
        }
    }
}
