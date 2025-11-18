import './anonymousPlayer.css'

/**
 * Componente de selección anónima
 * - Muestra una tarjeta con un grid de 6 "circulitos" (personajes)
 * - Permite elegir una imagen (personaje) y escribir un apodo
 * - Expone utilidades para actualizar imágenes y leer los valores elegidos
 *
 * Notas de build:
 * - Las rutas de imágenes se resuelven con `new URL(path, import.meta.url).href`,
 *   que es la forma recomendada con Vite para empaquetar assets de `src/assets`.
 */

// URL del villager desde src/assets usando import.meta.url (compatible con Vite)
// Ejemplos de rutas de imágenes empaquetadas por Vite.
const villagerUrl = new URL('../../assets/characters/villager.png', import.meta.url).href
const wereWolfUrl = new URL('../../assets/characters/werewolf.png', import.meta.url).href
const witchUrl = new URL('../../assets/characters/witch.png', import.meta.url).href
const seerUrl = new URL('../../assets/characters/seer.png', import.meta.url).href
const hunterUrl = new URL('../../assets/characters/hunter.png', import.meta.url).href
const thiefUrl = new URL('../../assets/characters/thief.png', import.meta.url).href


/**
 * Describe una opción de personaje en el grid.
 * - `id`: identificador único que usamos para marcar la selección.
 * - `imagePath`: ruta absoluta (href) de la imagen ya resuelta por Vite.
 * - `colorClass`: clase de color de respaldo por si no hay imagen.
 */
export interface CharacterOption {
    id: string
    imagePath?: string
    colorClass: string
}

/**
 * Clase principal del selector de "Anónimo".
 * Se instancia con un contenedor destino, se llama a `render()` y el
 * componente se encarga del DOM y eventos.
 */
export class AnonymousSelectorComponent {
    private container: HTMLElement
    private rootElement!: HTMLDivElement
    private selectedCharacterId: string | null = null
    private characters: CharacterOption[] = []

    /**
     * @param container Elemento HTML donde se montará el componente
     */
    constructor(container: HTMLElement) {
        this.container = container
        this.initializeCharacters()
    }

    /**
     * Inicializa las 6 opciones de personaje.
     * Aquí definimos la imagen (si existe) y un color de respaldo.
     */
    private initializeCharacters(): void {
        this.characters = [
            { id: 'char-1', colorClass: 'char-1', imagePath: villagerUrl },
            { id: 'char-2', colorClass: 'char-2', imagePath: wereWolfUrl },
            { id: 'char-3', colorClass: 'char-3', imagePath: witchUrl },
            { id: 'char-4', colorClass: 'char-4', imagePath: seerUrl },
            { id: 'char-5', colorClass: 'char-5', imagePath: hunterUrl },
            { id: 'char-6', colorClass: 'char-6', imagePath: thiefUrl },
        ]
    }

    /**
     * Renderiza toda la tarjeta dentro del contenedor indicado en el constructor.
     * - Limpia el contenedor
     * - Crea la estructura (header, grid, input, botón)
     * - Registra los listeners de interacción
     */
    render(): void {
        // 1) Limpiar el contenedor (idempotente)
        this.container.innerHTML = ''

        // 2) Contenedor principal de la tarjeta
        const anonymousContainer = document.createElement('div')
        anonymousContainer.className = 'anonymous-container'

        // 3) Card principal con sombra y borde redondeado
        const card = document.createElement('div')
        card.className = 'anonymous-card'

        // 4) Header (título de la tarjeta)
        const header = document.createElement('div')
        header.className = 'anonymous-header'

        const title = document.createElement('h2')
        title.textContent = 'Anónimo'
        header.append(title)

        // 5) Cuerpo con contenido principal
        const body = document.createElement('div')
        body.className = 'anonymous-body'

        // 6) Texto de ayuda
        const description = document.createElement('p')
        description.className = 'anonymous-description'
        description.textContent = 'Elige una foto y un apodo'

        // 7) Grid con las 6 opciones de personaje
        const characterGrid = document.createElement('div')
        characterGrid.className = 'character-grid'
        characterGrid.id = 'character-grid'

        // 7.1) Pintamos cada círculo del grid
        this.characters.forEach((character) => {
            const circle = this.createCharacterCircle(character)
            characterGrid.append(circle)
        })

        // 8) Input de nickname (apodo)
        const nicknameGroup = document.createElement('div')
        nicknameGroup.className = 'nickname-input-group'

        const nicknameInput = document.createElement('input')
        nicknameInput.type = 'text'
        nicknameInput.id = 'nickname-input'
        nicknameInput.placeholder = 'MiNickName522'
        nicknameInput.maxLength = 20
        nicknameInput.autocomplete = 'off'

        nicknameGroup.append(nicknameInput)

        // 9) Mensaje de error (oculto hasta que haya algo que mostrar)
        const errorMessage = document.createElement('p')
        errorMessage.className = 'anonymous-error-message'
        errorMessage.id = 'anonymous-error'

        // 10) Botón principal de acción
        const createButton = document.createElement('button')
        createButton.type = 'button'
        createButton.className = 'create-room-button'
        createButton.id = 'create-room-button'
        createButton.textContent = 'Unirse a partida'

        body.append(
            description,
            characterGrid,
            nicknameGroup,
            errorMessage,
            createButton
        )
        card.append(header, body)
        anonymousContainer.append(card)
        this.container.append(anonymousContainer)

        // 11) Guardamos referencia a la raíz para futuras consultas de DOM
        this.rootElement = anonymousContainer

        // 12) Enlazamos eventos del grid, input y botón
        this.setupEventListeners()
    }

    /**
     * Crea un "circulito" del grid (una opción de personaje).
     * Si `character.imagePath` existe, mete un <img> que se recorta con `object-fit: cover`.
     * @param character Opción a pintar
     * @returns Div con clases y contenido listos para insertar
     */
    private createCharacterCircle(character: CharacterOption): HTMLDivElement {
        const circle = document.createElement('div')
        circle.className = `character-circle ${character.colorClass}`
        circle.dataset.characterId = character.id

        // Si hay imagen, eliminamos el color de fondo (quedará transparente)
        // y añadimos un <img> que ocupa todo el círculo.
        if (character.imagePath) {
            circle.style.backgroundColor = 'transparent'
            const img = document.createElement('img')
            img.src = character.imagePath
            img.alt = ''
            img.style.width = '100%'
            img.style.height = '100%'
            img.style.objectFit = 'cover'
            img.style.borderRadius = '50%'
            img.style.display = 'block'
            img.style.pointerEvents = 'none'
            circle.appendChild(img)
        }

        return circle
    }

    /**
     * Configura los listeners de interacción del componente:
     * - Click en el grid para seleccionar un personaje (usa `closest` para que funcione al clicar en la imagen)
     * - Click en el botón para crear la sala
     * - Enter en el input para disparar la misma acción
     */
    private setupEventListeners(): void {
        const characterGrid = this.rootElement.querySelector('#character-grid')
        const createButton = this.rootElement.querySelector('#create-room-button')
        const nicknameInput = this.rootElement.querySelector(
            '#nickname-input'
        ) as HTMLInputElement

        // Click en personajes
        if (characterGrid) {
            characterGrid.addEventListener('click', (event) => {
                const target = event.target as HTMLElement
                const circle = target.closest('.character-circle') as
                    | HTMLElement
                    | null
                if (circle) {
                    this.handleCharacterSelect(circle)
                }
            })
        }

        // Click en crear sala
        if (createButton) {
            createButton.addEventListener('click', () =>
                this.handleCreateRoom(nicknameInput)
            )
        }

        // Enter en el input
        if (nicknameInput) {
            nicknameInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.handleCreateRoom(nicknameInput)
                }
            })
        }
    }

    /**
     * Maneja la selección de un personaje:
     * - Quita la clase `selected` del resto
     * - Añade `selected` al elemento clicado
     * - Actualiza `selectedCharacterId` con el id del dataset
     */
    private handleCharacterSelect(circleElement: HTMLElement): void {
        // Quitar selección anterior
        const allCircles = this.rootElement.querySelectorAll('.character-circle')
        allCircles.forEach((circle) => circle.classList.remove('selected'))

        // Agregar selección al nuevo
        circleElement.classList.add('selected')
        this.selectedCharacterId = circleElement.dataset.characterId || null

        // Limpiar error si había (feedback inmediato al usuario)
        this.clearError()

        // Aquí podríamos emitir un evento o callback si hiciera falta
    }

    /**
     * Maneja el click del botón principal (o Enter en el input):
     * - Valida que haya personaje seleccionado y apodo válido
     * - Si todo va bien, aquí llamaríamos al controlador que cree la sala
     */
    private handleCreateRoom(nicknameInput: HTMLInputElement): void {
        const nickname = nicknameInput.value.trim()

        // Limpiar error previo
        this.clearError()

        // Validar que haya personaje seleccionado
        if (!this.selectedCharacterId) {
            this.showError('Por favor, selecciona una foto ')
            return
        }

        // Validar nickname
        if (!nickname) {
            this.showError('Por favor, ingresa un apodo')
            nicknameInput.focus()
            return
        }

        if (nickname.length < 3) {
            this.showError('El apodo debe tener al menos 3 caracteres')
            nicknameInput.focus()
            return
        }

        // En una integración real, delegaríamos la acción al controlador o provider
        console.log('Crear sala:', {
            character: this.selectedCharacterId,
            nickname: nickname,
        })

        // Aquí se conectaría con el controlador
        // gameController.createAnonymousRoom({ character: this.selectedCharacterId, nickname })
    }

    /**
     * Muestra un mensaje de error en la zona inferior del formulario.
     * @param message Texto a mostrar
     */
    private showError(message: string): void {
        const errorElement = this.rootElement.querySelector(
            '#anonymous-error'
        ) as HTMLElement | null

        if (errorElement) {
            errorElement.textContent = message
        }
    }

    /**
     * Limpia el mensaje de error (si hubiese alguno visible).
     */
    private clearError(): void {
        const errorElement = this.rootElement.querySelector(
            '#anonymous-error'
        ) as HTMLElement | null

        if (errorElement) {
            errorElement.textContent = ''
        }
    }

    /**
     * Actualiza las imágenes de los personajes ya pintados.
     * Uso típico: tras cargar ficheros o decidir dinámicamente qué imagen corresponde a cada id.
     * @param characterImages Mapa { 'char-1': 'ruta.png', ... }
     */
    updateCharacterImages(characterImages: Record<string, string>): void {
        Object.entries(characterImages).forEach(([characterId, imagePath]) => {
            const character = this.characters.find((c) => c.id === characterId)
            if (character) {
                character.imagePath = imagePath
            }

            // Actualizar en el DOM si ya está renderizado
            if (this.rootElement) {
                const circleElement = this.rootElement.querySelector(
                    `[data-character-id="${characterId}"]`
                ) as HTMLElement | null

                if (circleElement && imagePath) {
                    // Asegurar que haya un <img> dentro y actualizar su `src`
                    circleElement.style.backgroundColor = 'transparent'
                    let img = circleElement.querySelector('img') as
                        | HTMLImageElement
                        | null
                    if (!img) {
                        img = document.createElement('img')
                        img.alt = ''
                        img.style.width = '100%'
                        img.style.height = '100%'
                        img.style.objectFit = 'cover'
                        img.style.borderRadius = '50%'
                        img.style.display = 'block'
                        img.style.pointerEvents = 'none'
                        circleElement.appendChild(img)
                    }
                    img.src = imagePath
                }
            }
        })
    }

    /**
     * @returns id del personaje seleccionado o `null` si aún no se eligió
     */
    getSelectedCharacter(): string | null {
        return this.selectedCharacterId
    }

    /**
     * @returns el apodo introducido (sin espacios) o cadena vacía si no hay input
     */
    getNickname(): string {
        const nicknameInput = this.rootElement?.querySelector(
            '#nickname-input'
        ) as HTMLInputElement | null
        return nicknameInput?.value.trim() || ''
    }
}
