import './adminPanel.css'
import UserProfileContainer from '../userProfileContainer/userProfileContainer'
import AdminUsersTableComponent from '../adminUserTable/adminUserTable'
import AdminGamesTableComponent from '../adminGamesTable/adminGamesTable'

export class AdminPanelComponent {
    private container: HTMLElement
    private activeTab: 'users' | 'games' = 'users'

    private contentContainer: HTMLElement | null = null
    private titleElement: HTMLElement | null = null

    constructor(container: HTMLElement) {
        this.container = container
    }

    render(): void {
        this.container.innerHTML = ''

        // 1. Overlay principal
        const overlay = document.createElement('div')
        overlay.className = 'admin-overlay'

        // 2. Elementos estructurales
        const sidebar = this.renderSidebar()
        const main = this.renderMainLayout()

        // 3. BOTÓN DE CERRAR (Nivel Superior)
        const closeBtn = document.createElement('button')
        closeBtn.className = 'btn-close-top'
        closeBtn.innerHTML = '&#10005;' // X
        closeBtn.onclick = () => this.exitAdminPanel()

        // 4. Montaje - añadimos sidebar, main y closeBtn al overlay
        overlay.append(sidebar, main, closeBtn)

        this.container.appendChild(overlay)

        this.loadTabContent()
    }

    private renderSidebar(): HTMLElement {
        const sidebar = document.createElement('aside')
        sidebar.className = 'admin-sidebar'

        const header = document.createElement('div')
        header.className = 'sidebar-header'
        header.innerHTML = `<h2>Panel Admin</h2>`

        const menu = document.createElement('nav')
        menu.className = 'sidebar-menu'

        const btnUsers = this.createMenuBtn('👥 Usuarios', 'users')
        const btnGames = this.createMenuBtn('🎮 Partidas', 'games')

        menu.append(btnUsers, btnGames)

        const footer = document.createElement('div')
        footer.className = 'sidebar-footer'

        const exitBtn = document.createElement('button')
        exitBtn.className = 'btn-exit'
        exitBtn.textContent = '← Volver al Juego'
        exitBtn.onclick = () => this.exitAdminPanel()

        footer.appendChild(exitBtn)
        sidebar.append(header, menu, footer)
        return sidebar
    }

    private createMenuBtn(
        label: string,
        tab: 'users' | 'games'
    ): HTMLButtonElement {
        const btn = document.createElement('button')
        btn.className = `menu-btn ${this.activeTab === tab ? 'active' : ''}`
        btn.textContent = label
        btn.onclick = () => this.switchTab(tab, btn)
        return btn
    }

    private renderMainLayout(): HTMLElement {
        const main = document.createElement('main')
        main.className = 'admin-main'

        // Topbar simple
        const topbar = document.createElement('div')
        topbar.className = 'admin-topbar'

        this.titleElement = document.createElement('h1')
        this.titleElement.textContent = 'Gestión de Usuarios'

        topbar.appendChild(this.titleElement)

        // Contenedor de datos
        this.contentContainer = document.createElement('div')
        this.contentContainer.className = 'table-container'
        this.contentContainer.textContent = 'Cargando datos...'

        main.append(topbar, this.contentContainer)
        return main
    }

    private switchTab(
        tab: 'users' | 'games',
        clickedBtn: HTMLButtonElement
    ): void {
        if (this.activeTab === tab) return
        this.activeTab = tab
        document
            .querySelectorAll('.menu-btn')
            .forEach((b) => b.classList.remove('active'))
        clickedBtn.classList.add('active')
        this.loadTabContent()
    }

    private loadTabContent(): void {
        if (!this.contentContainer || !this.titleElement) return
        this.contentContainer.innerHTML = ''

        if (this.activeTab === 'users') {
            this.titleElement.textContent = 'Gestión de Usuarios'
            const usersTable = new AdminUsersTableComponent(
                this.contentContainer
            )
            usersTable.render()
        } else {
            this.titleElement.textContent = 'Gestión de Partidas'
            const gamesTable = new AdminGamesTableComponent(
                this.contentContainer
            )
            gamesTable.render()
        }
    }

    private exitAdminPanel(): void {
        // Volvemos al perfil completo usando el contenedor principal
        const app = document.getElementById('app')
        if (!app) return
        app.innerHTML = ''
        const profileContainer = new UserProfileContainer(app)
        profileContainer.render()
    }
}

export default AdminPanelComponent
