import './adminGamesTable.css'
import { gameController } from '../../controllers/GameController'
import type { Game } from '../../models/models'

/**
 * tabla de partidas para el panel de admin
 * permite ver todas las partidas y eliminarlas
 */
export class AdminGamesTableComponent {
    private container: HTMLElement
    private allGames: Game[] = []

    constructor(container: HTMLElement) {
        this.container = container
    }

    async render() {
        this.container.innerHTML =
            '<div class="loading-spinner">Cargando partidas...</div>'

        // obtenemos todas las partidas
        const games = await gameController.getGamesList()

        this.allGames = games || []
        this.container.innerHTML = ''

        // cabecera con buscador y boton crear
        const headerContainer = document.createElement('div')
        headerContainer.className = 'table-header'

        // buscador
        const searchContainer = document.createElement('div')
        searchContainer.className = 'search-container'

        const searchInput = document.createElement('input')
        searchInput.type = 'text'
        searchInput.placeholder = '🔍 Buscar por ID o estado...'
        searchInput.className = 'search-input'

        searchInput.oninput = (e) => {
            const term = (e.target as HTMLInputElement).value.toLowerCase()
            const filtered = this.allGames.filter(
                (game) =>
                    game.id.toString().includes(term) ||
                    game.state.toLowerCase().includes(term)
            )
            this.renderTableBody(filtered)
        }

        searchContainer.appendChild(searchInput)

        // boton crear partida
        const createBtn = document.createElement('button')
        createBtn.className = 'btn-create-game'
        createBtn.textContent = '➕ Crear Partida'
        createBtn.onclick = () => this.handleCreateGame()

        headerContainer.append(searchContainer, createBtn)
        this.container.appendChild(headerContainer)

        // tabla
        const wrapper = document.createElement('div')
        wrapper.className = 'admin-table-wrapper'

        const table = document.createElement('table')
        table.className = 'games-table'

        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Estado</th>
                    <th>Jugadores</th>
                    <th>Acciones</th>
                    
                </tr>
            </thead>
            <tbody id="games-table-body"></tbody>
        `

        wrapper.appendChild(table)
        this.container.appendChild(wrapper)

        this.renderTableBody(this.allGames)
    }

    /**
     * pinta las filas de la tabla de partidas
     */
    private renderTableBody(games: Game[]) {
        const tbody = this.container.querySelector('#games-table-body')
        if (!tbody) return

        tbody.innerHTML = ''

        if (games.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5" class="no-results">No se encontraron partidas</td></tr>'
            return
        }

        games.forEach((game) => {
            const tr = document.createElement('tr')

            // badge de estado con color segun el estado
            const stateBadge = this.getStateBadge(game.state)

            // contamos participantes si existen
            const playersCount = game.participants?.length || 0

            tr.innerHTML = `
                <td><strong>#${game.id}</strong></td>
                <td>${stateBadge}</td>
                <td>👥 ${playersCount}</td>
                <td class="actions-cell">
                    <button class="action-btn btn-delete" title="Eliminar partida">🗑️</button>
                </td>
            `

            // evento eliminar
            const btnDelete = tr.querySelector(
                '.btn-delete'
            ) as HTMLButtonElement
            btnDelete.onclick = () => this.handleDeleteGame(game)

            tbody.appendChild(tr)
        })
    }

    /**
     * devuelve un badge con color segun el estado de la partida
     * mostramos el nombre original del backend para que el buscador funcione
     */
    private getStateBadge(state: string): string {
        const stateColors: Record<string, string> = {
            waiting: 'state-waiting',
            playing: 'state-playing',
            finished: 'state-finished',
            day: 'state-day',
            night: 'state-night',
        }

        // iconos para cada estado
        const stateIcons: Record<string, string> = {
            waiting: '⏳',
            playing: '🎮',
            finished: '🏁',
            day: '☀️',
            night: '🌙',
        }

        const cssClass = stateColors[state.toLowerCase()] || 'state-default'
        const icon = stateIcons[state.toLowerCase()] || '📋'

        // mostramos el nombre original del back con el icono
        return `<span class="state-badge ${cssClass}">${icon} ${state.toUpperCase()}</span>`
    }

    /**
     * elimina una partida (con confirmacion)
     */
    private async handleDeleteGame(game: Game) {
        const confirmed = confirm(
            `¿Eliminar la partida #${game.id}?\n\nEsta acción no se puede deshacer.`
        )

        if (!confirmed) return

        const success = await gameController.deleteGame(game.id)

        if (success) {
            // quitamos la partida de la lista local y repintamos
            this.allGames = this.allGames.filter((g) => g.id !== game.id)
            this.renderTableBody(this.allGames)
        }
    }

    /**
     * crea una partida nueva
     */
    private async handleCreateGame() {
        const newGame = await gameController.createGame()

        if (newGame) {
            // añadimos la partida nueva a la lista y repintamos
            this.allGames.unshift(newGame) // la ponemos al principio
            this.renderTableBody(this.allGames)
        }
    }
}

export default AdminGamesTableComponent
