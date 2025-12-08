import './adminUserTable.css'
import { userController } from '../../controllers/UserController'
import type { User } from '../../models/models'
import photo from '../../assets/characters/werewolf.png'
import CreateUserModal from '../createUserModal/createUserModal'

/**
 * tabla de usuarios para el panel de admin
 * permite buscar, editar y eliminar usuarios
 * la edicion se hace directamente en la fila (inline)
 */
export class AdminUsersTableComponent {
    private container: HTMLElement
    private allUsers: User[] = []
    private currentUserId: number | null = null
    private editingUserId: number | null = null // id del usuario que estamos editando

    constructor(container: HTMLElement) {
        this.container = container
    }

    async render() {
        this.container.innerHTML =
            '<div class="loading-spinner">Cargando usuarios...</div>'

        const currentUser = userController.currentUser
        if (currentUser) {
            this.currentUserId = currentUser.id
        }

        const users = await userController.getAllUsers()

        if (!users) {
            this.container.innerHTML =
                '<p class="error-msg">No se pudieron cargar los usuarios.</p>'
            return
        }

        this.allUsers = users
        this.container.innerHTML = ''

        // cabecera con buscador y boton crear
        const headerContainer = document.createElement('div')
        headerContainer.className = 'table-header'

        // buscador
        const searchContainer = document.createElement('div')
        searchContainer.className = 'search-container'

        const searchInput = document.createElement('input')
        searchInput.type = 'text'
        searchInput.placeholder = '🔍 Buscar por Nickname o ID...'
        searchInput.className = 'search-input'

        searchInput.oninput = (e) => {
            const term = (e.target as HTMLInputElement).value.toLowerCase()
            const filtered = this.allUsers.filter(
                (user) =>
                    user.nickname.toLowerCase().includes(term) ||
                    user.id.toString().includes(term) ||
                    (user.email && user.email.toLowerCase().includes(term))
            )
            this.renderTableBody(filtered)
        }

        searchContainer.appendChild(searchInput)

        // boton crear usuario
        const createBtn = document.createElement('button')
        createBtn.className = 'btn-create-user'
        createBtn.textContent = '➕ Crear Usuario'
        createBtn.onclick = () => this.handleCreateUser()

        headerContainer.append(searchContainer, createBtn)
        this.container.appendChild(headerContainer)

        // tabla
        const wrapper = document.createElement('div')
        wrapper.className = 'admin-table-wrapper'

        const table = document.createElement('table')
        table.className = 'users-table'

        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Avatar</th>
                    <th>Nickname</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="users-table-body"></tbody>
        `

        wrapper.appendChild(table)
        this.container.appendChild(wrapper)

        this.renderTableBody(this.allUsers)
    }

    /**
     * pinta las filas de la tabla
     * si un usuario esta en modo edicion, muestra inputs en vez de texto
     */
    private renderTableBody(users: User[]) {
        const tbody = this.container.querySelector('#users-table-body')
        if (!tbody) return

        tbody.innerHTML = ''

        if (users.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6" class="no-results">No se encontraron usuarios</td></tr>'
            return
        }

        users.forEach((user) => {
            const tr = document.createElement('tr')
            const isMe = user.id === this.currentUserId
            const isEditing = user.id === this.editingUserId

            if (isMe) tr.classList.add('my-row')
            if (isEditing) tr.classList.add('editing-row')

            const avatarUrl = user.profile_url || photo

            const rolesHtml = user.roles
                ? user.roles
                      .map(
                          (r) =>
                              `<span class="role-badge ${r.name}">${r.name}</span>`
                      )
                      .join('')
                : '<span class="role-badge">user</span>'

            // si estamos editando, mostramos inputs
            if (isEditing) {
                tr.innerHTML = `
                    <td>#${user.id}</td>
                    <td><img src="${avatarUrl}" class="table-avatar" alt="Avatar"></td>
                    <td>
                        <input type="text" class="inline-input" id="edit-nick-${user.id}" value="${user.nickname}">
                    </td>
                    <td>
                        <input type="email" class="inline-input" id="edit-email-${user.id}" value="${user.email || ''}">
                    </td>
                    <td>${rolesHtml}</td>
                    <td class="actions-cell">
                        <button class="action-btn btn-save" title="Guardar">💾</button>
                        <button class="action-btn btn-cancel" title="Cancelar">❌</button>
                    </td>
                `

                // eventos de guardar y cancelar
                const btnSave = tr.querySelector(
                    '.btn-save'
                ) as HTMLButtonElement
                const btnCancel = tr.querySelector(
                    '.btn-cancel'
                ) as HTMLButtonElement

                btnSave.onclick = () => this.saveUser(user.id)
                btnCancel.onclick = () => this.cancelEdit()
            } else {
                // modo normal: solo texto
                const deleteButtonHtml = isMe
                    ? `<button class="action-btn btn-delete" title="No puedes eliminarte" disabled>🗑️</button>`
                    : `<button class="action-btn btn-delete" title="Eliminar">🗑️</button>`

                tr.innerHTML = `
                    <td>#${user.id}</td>
                    <td><img src="${avatarUrl}" class="table-avatar" alt="Avatar"></td>
                    <td><strong>${user.nickname}</strong>${isMe ? ' <span class="you-badge">(Tú)</span>' : ''}</td>
                    <td>${user.email || '<em style="color:#777">Sin email</em>'}</td>
                    <td>${rolesHtml}</td>
                    <td class="actions-cell">
                        <button class="action-btn btn-edit" title="Editar">✏️</button>
                        ${deleteButtonHtml}
                    </td>
                `

                // eventos
                const btnEdit = tr.querySelector(
                    '.btn-edit'
                ) as HTMLButtonElement
                btnEdit.onclick = () => this.startEdit(user.id)

                if (!isMe) {
                    const btnDelete = tr.querySelector(
                        '.btn-delete'
                    ) as HTMLButtonElement
                    btnDelete.onclick = () => this.handleDeleteUser(user)
                }
            }

            tbody.appendChild(tr)
        })
    }

    /**
     * activa el modo edicion para un usuario
     */
    private startEdit(userId: number) {
        this.editingUserId = userId
        this.renderTableBody(this.allUsers)
    }

    /**
     * cancela la edicion y vuelve al modo normal
     */
    private cancelEdit() {
        this.editingUserId = null
        this.renderTableBody(this.allUsers)
    }

    /**
     * guarda los cambios del usuario
     */
    private async saveUser(userId: number) {
        const nickInput = document.getElementById(
            `edit-nick-${userId}`
        ) as HTMLInputElement
        const emailInput = document.getElementById(
            `edit-email-${userId}`
        ) as HTMLInputElement

        const nickname = nickInput.value.trim()
        const email = emailInput.value.trim()

        // validaciones basicas
        if (nickname.length < 3) {
            alert('El nickname debe tener al menos 3 caracteres')
            return
        }

        // guardar en el servidor
        const success = await userController.updateUser(userId, {
            nickname,
            email,
        })

        if (success) {
            // actualizar en nuestra lista local
            const user = this.allUsers.find((u) => u.id === userId)
            if (user) {
                user.nickname = nickname
                user.email = email
            }
            this.editingUserId = null
            this.renderTableBody(this.allUsers)
        }
    }

    /**
     * elimina un usuario (con confirmacion)
     */
    private async handleDeleteUser(user: User) {
        const confirmed = confirm(
            `¿Eliminar a "${user.nickname}"?\n\nEsta acción no se puede deshacer.`
        )

        if (!confirmed) return

        const success = await userController.deleteUser(user.id)

        if (success) {
            this.allUsers = this.allUsers.filter((u) => u.id !== user.id)
            this.renderTableBody(this.allUsers)
        }
    }
    /**
     * recarga la lista de usuarios desde el servidor
     */
    private async loadUsers() {
        const users = await userController.getAllUsers()
        if (users) {
            this.allUsers = users
            this.renderTableBody(this.allUsers)
        }
    }

    /**
     * abre el modal para crear un nuevo usuario
     */
    private handleCreateUser() {
        const modal = new CreateUserModal(() => {
            // callback cuando se crea el usuario - refrescar la lista
            this.loadUsers()
        })
        modal.show()
    }
}

export default AdminUsersTableComponent
