import type { SlideData } from '../../models/models'

export class Slide {
    private slideData: SlideData
    private slideElement: HTMLDivElement

    constructor(slideData: SlideData) {
        this.slideData = slideData
        this.slideElement = this.createSlideElement()
    }

    /**
     * Método por el que genera y devuelve el elemento HTML para esta diapositiva
     * @returns HTMLDivElement
     */
    private createSlideElement(): HTMLDivElement {
        //Contenedor principal
        const slide = document.createElement('div')
        slide.classList.add('carousel-slide')

        //Imagen
        const img = document.createElement('img')
        img.classList.add('slide-image')
        img.src = this.slideData.imageUrl
        img.alt = `Step ${this.slideData.stepNumber}`
        slide.appendChild(img)

        //Contenido de texto
        const textContent = document.createElement('div')
        textContent.classList.add('slide-text-content')
        //Titulo
        const title = document.createElement('h3')
        title.textContent = this.slideData.tittle
        textContent.appendChild(title)

        //Descripción
        const description = document.createElement('p')
        description.textContent = this.slideData.description
        textContent.appendChild(description)

        slide.appendChild(textContent)

        return slide
    }

    public getElement(): HTMLDivElement {
        return this.slideElement
    }
}
