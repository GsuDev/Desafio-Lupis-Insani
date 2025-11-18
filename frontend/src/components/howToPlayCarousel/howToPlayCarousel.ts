//1º importo el css

import './howToPlayCarousel.css'
import type { ISlideData } from '../../interfaces/carousel'
import { Slide } from './slideCarousel'
import { Pagination } from './paginationCarousel'

// --------------------------------------------------
// Funciones "Constructoras" de HTML
// --------------------------------------------------

export class Carousel {
    //propiedades
    private container: HTMLDivElement //-> donde se renderiza
    private slidesData: ISlideData[]
    private currentIndex: number

    //referencia a los subcomponentes
    private currentSlideComponent: Slide | null = null
    private paginationComponent: Pagination | null = null

    //referencia a los elementos del dom
    private slideDisplayElement!: HTMLElement // si no pongo la exclamacion me daba error
    private paginationContainerElement!: HTMLElement

    private prevButton: HTMLButtonElement | null = null
    private nextButton: HTMLButtonElement | null = null

    constructor(
        containerID: string,
        slidesData: ISlideData[],
        initialIndex: number = 0
    ) {
        const container = document.getElementById(containerID)
        if (!container) {
            throw new Error(
                `No se pudo encontrar el contenedor con el ID ${containerID}`
            )
        }

        this.container = container as HTMLDivElement
        this.slidesData = slidesData
        this.currentIndex = initialIndex

        //Crea la estrutura para el DOM
        this.initDOM()
        //Mete los listeners
        this.attachEventListeners()
        //Renderiza la estructura en el dom
        this.updateView()
    }

    /**
     * Crea la estrucutra del HTML
     */
    private initDOM(): void {
        //primero limpiea el contenedor
        this.container.innerHTML = ''
        this.container.className = 'carousel-container'

        //Titulo principal
        const mainTitle = document.createElement('h2')
        mainTitle.className = 'carousel-main-title'
        mainTitle.textContent = 'PISTAS/CONSEJOS'

        //Contenedor para el slide y botones
        const slideAndControls = document.createElement('div')
        slideAndControls.className = 'carousel-slide-and-controls'

        //Boton Anterior
        this.prevButton = document.createElement('button')
        this.prevButton.className = 'carouel-nav-button prev'
        this.prevButton.innerHTML = '&#10094;'
        this.prevButton.setAttribute('aria-label', 'Consejo Anterior')

        //Boton Siguiente
        this.nextButton = document.createElement('button')
        this.nextButton.className = 'carouel-nav-button next'
        this.nextButton.innerHTML = '&#10095;'
        this.nextButton.setAttribute('aria-label', 'Consejo Siguiente')

        //Crea el div donde se mostrará la imagen con el consejo
        this.slideDisplayElement = document.createElement('div')
        this.slideDisplayElement.className = 'carousel-slide-display'

        //Crea el div para los puntos de la paginación
        this.paginationContainerElement = document.createElement('div')
        this.paginationContainerElement.className =
            'carousel-pagination-container'

        //Añade todo al contenedor
        this.container.appendChild(mainTitle)

        slideAndControls.appendChild(this.prevButton)
        slideAndControls.appendChild(this.slideDisplayElement)
        slideAndControls.appendChild(this.nextButton)

        this.container.appendChild(slideAndControls)
        this.container.appendChild(this.paginationContainerElement)
    }

    private attachEventListeners(): void {
        this.prevButton?.addEventListener('click', () => this.prevSlide())
        this.nextButton?.addEventListener('click', () => this.nextSlide())
    }

    /**
     * Actualiza/ carga la vista en el DOM
     */
    private updateView(): void {
        //1º Actualiza el slide
        this.currentSlideComponent = new Slide(
            this.slidesData[this.currentIndex]
        )
        this.slideDisplayElement.innerHTML = '' //Limpia el contenedor
        this.slideDisplayElement.appendChild(
            this.currentSlideComponent.getElement()
        )

        //2º Actualiza la paginación
        this.paginationComponent = new Pagination(
            this.slidesData.length,
            this.currentIndex,
            (newIndex: number) => this.goToSlide(newIndex)
        )
        this.paginationContainerElement.innerHTML = ''
        this.paginationContainerElement.appendChild(
            this.paginationComponent.render()
        )

        //3º Actualiza los botones de navegación
        this.updateNavButtonState()
    }

    private updateNavButtonState(): void {
        // this.prevButton!.disabled = this.currentIndex === 0;
        // this.nextButton!.disabled = this.currentIndex === this.slidesData.length - 1;
        // //Si queremos implementar que de desactiven
        // if(this.prevButton!.disabled){
        //     this.prevButton!.classList.add('disabled');
        // }else{
        //     this.prevButton!.classList.remove('disabled');
        // }
        // if(this.nextButton!.disabled){
        //     this.nextButton!.classList.add('disabled');
        // }else{
        //     this.nextButton!.classList.remove('disabled');
        // }
    }

    public goToSlide(index: number): void {
        //Valido que sea correcto y que no sea el mismo
        if (
            index === this.currentIndex ||
            index < 0 ||
            index >= this.slidesData.length
        ) {
            return
        }

        this.currentIndex = index
        this.updateView()
    }

    public prevSlide(): void {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1)
        } else {
            this.goToSlide(this.slidesData.length - 1)
        }
    }

    public nextSlide(): void {
        if (this.currentIndex < this.slidesData.length - 1) {
            this.goToSlide(this.currentIndex + 1)
        } else {
            this.goToSlide(0)
        }
    }
}
