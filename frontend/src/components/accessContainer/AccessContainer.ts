import './access-container.css'
import { AnonymousSelectorComponent } from '../anonymousPlayer/anonymousPlayer'
import { LoginFormComponent } from '../loginForm/loginForm'
import { Carousel } from '../howToPlayCarousel/howToPlayCarousel'
import { datosSlides } from '../../providers/slides.mock'

class AccessContainer {
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    /**
     * Renderiza el contenedor y sus hijos
     */
    render(): void {
        const container = this.container

        // Header con logo y título
        const header = document.createElement('header')
        header.className = 'access-header'

        const titleContainer = document.createElement('div')
        titleContainer.className = 'title-container'

        // Logo SVG
        const logo = document.createElement('div')
        logo.className = 'logo'
        logo.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
            </svg>
        `

        const title = document.createElement('h1')
        title.textContent = 'LUPIS INSANI'

        const subtitle = document.createElement('p')
        subtitle.className = 'subtitle'
        subtitle.textContent = 'Hombres lobo de Castronegro'

        titleContainer.appendChild(logo)
        titleContainer.appendChild(title)
        header.appendChild(titleContainer)
        header.appendChild(subtitle)

        // Container de las tres tarjetas
        const cardsContainer = document.createElement('main')
        cardsContainer.id = 'mainContainer'
        cardsContainer.className = 'cards-container'

        // --------------------------
        // CARGA DE COMPONENTES HIJOS
        // --------------------------
        this.loadChildComponents(cardsContainer)

        // Añadir todo al container
        container.appendChild(header)
        container.appendChild(cardsContainer)
    }

    // Carga unificada de componentes hijos
    private loadChildComponents(container: HTMLElement) {
        // Creamos los componentes
        const anonymousCard = new AnonymousSelectorComponent(container)
        const loginCard = new LoginFormComponent(container)
        const carouselCard = new Carousel(container, datosSlides, 0)

        // Los renderizamos
        anonymousCard.render()
        loginCard.render()
        carouselCard.render()
    }
}

export default AccessContainer
