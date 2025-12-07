import { GameOverDetails, type GameOverData } from '../gameOver/gameOverDetails'
import './gameOverContainer.css'

export class GameOverContainer {
    private rootNode: HTMLElement // Dónde vamos a enchufar esto
    private containerElement: HTMLElement
    private detailsComponent: GameOverDetails

    constructor(rootNode: HTMLElement, data: GameOverData) {
        this.rootNode = rootNode

        this.detailsComponent = new GameOverDetails(data)

        this.containerElement = document.createElement('div')
        this.containerElement.classList.add('game-over-container')
    }

    public render(): void {
        this.containerElement.innerHTML = ''

        const detailsNode = this.detailsComponent.render()

        this.containerElement.appendChild(detailsNode)

        this.rootNode.appendChild(this.containerElement)

        // Añadimos clase al body para poder ocultar otros elementos con CSS
        document.body.classList.add('game-over-active')

        // pequeño truco para activar la animación de opacidad css
        requestAnimationFrame(() => {
            this.containerElement.classList.add('visible')
        })
    }

    // Método para destruir la modal si salimos de la partida
    public destroy(): void {
        this.containerElement.remove()
        document.body.classList.remove('game-over-active')
    }
}
