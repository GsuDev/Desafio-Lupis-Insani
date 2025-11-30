import './userStatistics.css'
import { userController } from '../../controllers/UserController'
import type { UserStatisticsData, GameStatistic } from '../../models/models'

class UserStatistics {
    private container: HTMLElement

    constructor(container: HTMLElement) {
        this.container = container
    }

    /**
     * Método principal de renderizado.
     * Es async porque pedirá datos al controlador
     */
    async render(): Promise<void> {
        console.log("🔥 ESTOY USANDO EL CÓDIGO NUEVO (SIN MOCK) 🔥")
        //muostrar estado de carga inicial
        this.container.innerHTML = '<div class="loading-stats">Cargando estadísticas...</div>'

        // se obtienen los datosdel backen realez
        const stats: UserStatisticsData | undefined = await userController.getStatistics()

        
        this.container.innerHTML = ''

        // Si no hay datos (error o fallo de conexión), mostramos error
        if (!stats) {
            this.renderError()
            return
        }

        // Si todo va bien, pintamos el contenido
        this.renderContent(stats)
    }

    /**
     * Pinta el contenido una vez tenemos los datos
     */
    private renderContent(stats: UserStatisticsData): void {
        const root = document.createElement('div')
        root.className = 'statistics-panel'

       
        const title = document.createElement('h2')
        title.className = 'stats-title'
        title.textContent = 'Historial'
        root.appendChild(title)

      
        const summary = document.createElement('div')
        summary.className = 'stats-summary'
        summary.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Jugadas</span>
                <span class="stat-value">${stats.totalGames}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Victorias</span>
                <span class="stat-value highlight">${stats.totalWins}</span>
            </div>
        `
        root.appendChild(summary)

        // Lista de partidas
        const listContainer = document.createElement('div')
        listContainer.className = 'games-list'

        if (stats.games.length === 0) {
            listContainer.innerHTML = '<p class="no-games">No hay partidas registradas.</p>'
        } else {
          
            stats.games.forEach(game => {
                const item = this.createGameItem(game)
                listContainer.appendChild(item)
            })
        }

        root.appendChild(listContainer)
        this.container.appendChild(root)
    }

    /**
     * Crea el elemento HTML para una fila de partida
     */
    private createGameItem(game: GameStatistic): HTMLElement {
        const item = document.createElement('div')
        // Añadimos clase 'won' o 'lost' para el borde de color
        item.className = `game-item ${game.won ? 'won' : 'lost'}`

        item.innerHTML = `
            <div class="game-info">
                <span class="game-id">Partida #${game.gameId}</span>
                <span class="game-char">${game.characterName}</span>
            </div>
            <div class="game-result">
                ${game.won ? '🏆 Victoria' : '💀 Derrota'}
            </div>
        `
        return item
    }


    private renderError(): void {
        this.container.innerHTML = '<p class="error-msg">No se pudieron cargar las estadísticas.</p>'
    }
}

export default UserStatistics