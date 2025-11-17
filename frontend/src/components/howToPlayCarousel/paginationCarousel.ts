
//Componente para controllar las "páginas del carrusel"
export class Pagination{
    private totalSlides: number;
    private currentSlide: number;

    //funcion que avisa cuando se haga click en un punto
    private onDotClick: (index: number) => void;

    constructor(totalSlides: number, currentIndex: number,  onDotClick: (index: number) => void){
        this.totalSlides = totalSlides;
        this.currentSlide = currentIndex;
        this.onDotClick = onDotClick;
    }

    /**
     * Metodo que devuelve el html para la paginación
     * @returns HTMLElement
     */
    public render():HTMLElement{
        const pagination = document.createElement('div');
        pagination.classList.add('pagination');

        //creo un punto por cada slide
        for(let i = 0; i < this.totalSlides; i++){
            const dot = document.createElement('div');
            dot.classList.add('pagination-dot');
            dot.setAttribute('aria-label',`Ir al slide ${i+1}`)
            
            //Marco el punto actual como activo
            if(i === this.currentSlide){
                dot.classList.add('active');
            }

            //Añado el metodo de listener pasandole el callback
            dot.addEventListener('click', () => this.onDotClick(i));
            pagination.appendChild(dot);
        }

        return pagination;
    }

}