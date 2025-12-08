import { DeathModalDetails } from '../deathModalDetails/deathModalDetails'
import './deathModalContainer.css'

export class DeathModalContainer {
    private rootNode: HTMLElement
    private containerElement: HTMLElement
    private detailsComponent: DeathModalDetails

    constructor(
        rootNode: HTMLElement,
        onSpectate: () => void,
        onExitTitle: () => void,
        onExitProfile: () => void
    ) {
        this.rootNode = rootNode

        this.detailsComponent = new DeathModalDetails(
            onSpectate,
            onExitTitle,
            onExitProfile
        )

        this.containerElement = document.createElement('div')
        this.containerElement.classList.add('death-modal-container')
    }

    public render(): void {
        this.containerElement.innerHTML = ''

        // Renderizamos los detalles dentro del contenedor
        const detailsNode = this.detailsComponent.render()
        this.containerElement.appendChild(detailsNode)

        // Lo añadimos al DOM
        this.rootNode.appendChild(this.containerElement)

        // Añadimos clase al body para ocultar el HUD del juego (chat, cartas, etc.)
        document.body.classList.add('death-modal-active')

        // Pequeño truco para activar la transición CSS de opacidad
        requestAnimationFrame(() => {
            this.containerElement.classList.add('visible')
        })
    }

    // Método para limpiar el modal (ej: si decide seguir viendo)
    public destroy(): void {
        this.containerElement.remove()
        document.body.classList.remove('death-modal-active')
    }
}
