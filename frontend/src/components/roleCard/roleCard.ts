import './roleCard.css'
import type { Participant } from '../../models/models' // Asegúrate de tener los tipos si los necesitas, o define PlayerRole aquí como tenías.

export type PlayerRole = 'villager' | 'wolf'

// 1. Cargar imágenes de la raíz de assets (para las cartas de prueba)
const rootAssets = import.meta.glob('../../assets/*.png', {
    eager: true,
})

// Función helper para obtener la URL final de la imagen
function getAssetUrl(
    globMap: Record<string, unknown>,
    relativePath: string
): string {
    const module = globMap[relativePath]
    if (module && typeof module === 'object' && 'default' in module) {
        return (module as any).default
    }
    console.warn(`Imagen no encontrada: ${relativePath}`)
    return ''
}

// 3. Mapear los roles a las rutas específicas usando el helper
const roleImages: Record<PlayerRole, string> = {
    // Usamos tus cartas de prueba actuales
    wolf: getAssetUrl(rootAssets, '../../assets/carta-lobo-prueba.png'),
    villager: getAssetUrl(rootAssets, '../../assets/carta-aldeano-prueba.png'),
}

export class RoleCard {
    private container: HTMLElement
    private role: PlayerRole

    constructor(container: HTMLElement, role: PlayerRole) {
        this.container = container
        this.role = role
    }

    render(): void {
        const card = document.createElement('div')

        card.className = `role-card role-${this.role}`

        // Asignar la imagen de fondo si existe
        const imageUrl = roleImages[this.role]
        if (imageUrl) {
            card.style.backgroundImage = `url(${imageUrl})`
        }

        card.title = `Tu rol: ${this.role.toUpperCase()}`
        this.container.appendChild(card)
    }
}

export default RoleCard
