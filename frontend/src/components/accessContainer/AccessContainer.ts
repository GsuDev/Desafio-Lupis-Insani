import './access-container.css'
import { AnonymousSelectorComponent } from '../anonymousPlayer/anonymousPlayer'
import { LoginFormComponent } from '../loginForm/loginForm'
import { Carousel } from '../howToPlayCarousel/howToPlayCarousel'
//import { getTipSlides } from '../../providers/game.provider'
import tipSlidesData from '../../assets/data/tipSlides.json'
import type { SlideData } from '../../models/models'

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
        const root = document.createElement('div')
        root.className = 'root-div'
        // Header con logo y título
        const header = document.createElement('header')
        header.className = 'access-header'

        const titleContainer = document.createElement('div')
        titleContainer.className = 'title-container'

        // Logo SVG
        const logo = document.createElement('img')
        logo.className = 'logo'
        logo.src = '/src/assets/icons/lupis-insani.png'

        const title = document.createElement('h1')
        title.textContent = 'LUPIS INSANI'

        titleContainer.appendChild(logo)
        titleContainer.appendChild(title)
        header.appendChild(titleContainer)

        // Container de las tres tarjetas
        const cardsContainer = document.createElement('main')
        cardsContainer.id = 'mainContainer'
        cardsContainer.className = 'cards-container'

        // --------------------------
        // CARGA DE COMPONENTES HIJOS
        // --------------------------
        this.loadChildComponents(cardsContainer)

        // Añadir todo al container
        root.appendChild(header)
        root.appendChild(cardsContainer)
        container.appendChild(root)
    }

    // Carga unificada de componentes hijos
    private async loadChildComponents(container: HTMLElement) {
        // Creamos los componentes
        const anonymousCard = new AnonymousSelectorComponent(container)
        const loginCard = new LoginFormComponent(container)
        /*const slides = await getTipSlides()
        let carouselCard
        if (slides.data) {
            carouselCard = new Carousel(container, slides.data.slides, 0)
        } else {
            carouselCard = new Carousel(
                container,
                [
                    {
                        stepNumber: 1,
                        title: 'LOBO',
                        description: 'LOBEA',
                        imageName:
                            'https://www.dadocritico.es/2534-medium_default/el-pacto-de-los-hombres-lobo-de-castronegro.jpg',
                    },
                ],
                0
            )
        }*/
        const carouselCard = new Carousel(
            container,
            tipSlidesData as unknown as SlideData[],
            0
        )

        // Los renderizamos
        anonymousCard.render()
        loginCard.render()
        carouselCard.render()
    }
}

export default AccessContainer
