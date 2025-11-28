import './userSettings.css'
import { userController } from '../../controllers/UserController'
import type { User } from '../../models/models'

export class UserSettingsComponent {
    private container: HTMLElement
    private userData: User

    constructor(container: HTMLElement) {
        this.container = container
        this.userData = userController.currentUser || {
            id: 0,
            nickname: '',
            name: '',
            lastname: null,
            email: null,
            birthdate: null,
            profile_url: null,
        }
    }

    render(): void {
        // Overlay
        const overlay = document.createElement('div')
        overlay.className = 'modal-overlay'
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        // Tarjeta
        const card = document.createElement('div')
        card.className = 'user-settings-card'

        // header
        const header = document.createElement('header')
        header.className = 'settings-header'

        const backBtn = document.createElement('button')
        backBtn.className = 'back-btn'
        backBtn.innerHTML = '&#8592;' // Flecha izquierda
        backBtn.onclick = () => this.closeModal()

        const title = document.createElement('h2')
        title.className = 'settings-title'
        title.textContent = 'EDITAR PERFIL'

        const spacer = document.createElement('div')
        spacer.style.width = '30px' // Para centrar el título

        header.append(backBtn, title, spacer)

        // formulario
        const form = document.createElement('form')
        form.className = 'settings-form'
        form.onsubmit = (e) => this.handleSubmit(e)

        // Sección Superior: Avatar + Datos
        const topSection = document.createElement('div')
        topSection.className = 'top-section'

        // Columna Avatar
        const avatarCol = document.createElement('div')
        avatarCol.className = 'avatar-col'
        const avatarImg = document.createElement('img')
        avatarImg.src =
            this.userData.profile_url ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${this.userData.nickname}`
        avatarImg.className = 'avatar-circle'

        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.name = 'profile_picture'
        fileInput.accept = 'image/*'
        fileInput.hidden = true
        fileInput.onchange = (e) => this.handleAvatarChange(e, avatarImg)

        // Click en la imagen abre el selector
        avatarImg.onclick = () => fileInput.click()
        avatarCol.append(avatarImg, fileInput)

        // Columna Info
        const infoCol = document.createElement('div')
        infoCol.className = 'info-col'

        const nickGroup = this.createInput(
            null,
            'nickname',
            'text',
            this.userData.nickname || '',
            'Nickname'
        )

        const nameRow = document.createElement('div')
        nameRow.className = 'name-row'
        const nameGroup = this.createInput(
            null,
            'name',
            'text',
            this.userData.name || '',
            'Nombre'
        )
        const lastnameGroup = this.createInput(
            null,
            'lastname',
            'text',
            this.userData.lastname || '',
            'Apellidos'
        )
        nameRow.append(nameGroup, lastnameGroup)

        infoCol.append(nickGroup, nameRow)
        topSection.append(avatarCol, infoCol)

        // Sección Inferior
        const emailGroup = this.createInput(
            null,
            'email',
            'email',
            this.userData.email || '',
            'Correo Electrónico'
        )

        const rawDate = this.userData.birthdate || ''
        const cleanDate = rawDate.split('T')[0]
        const birthGroup = this.createInput(
            null,
            'birthdate',
            'date',
            cleanDate,
            'Fecha Nacimiento'
        )

        const changePassBtn = document.createElement('button')
        changePassBtn.type = 'button'
        changePassBtn.className = 'btn-change-pass'
        changePassBtn.textContent = '🔒 Cambiar contraseña'
        changePassBtn.onclick = () => console.log('Abrir modal contraseña')

        form.append(topSection, emailGroup, birthGroup, changePassBtn)

        const footer = document.createElement('footer')
        footer.className = 'settings-footer'

        const cancelBtn = document.createElement('button')
        cancelBtn.type = 'button'
        cancelBtn.className = 'btn-cancel'
        cancelBtn.textContent = 'Cancelar'
        cancelBtn.onclick = () => this.closeModal()

        const saveBtn = document.createElement('button')
        saveBtn.className = 'btn-save'
        saveBtn.textContent = 'Actualizar datos'
        saveBtn.onclick = () => form.requestSubmit()

        footer.append(cancelBtn, saveBtn)

        // Ensamblaje Final
        card.append(header, form, footer)
        overlay.appendChild(card)
        this.container.appendChild(overlay)
    }

    private createInput(
        label: string | null,
        name: string,
        type: string,
        value: string,
        placeholder: string
    ): HTMLDivElement {
        const group = document.createElement('div')
        group.className = 'input-box'
        const input = document.createElement('input')
        input.type = type
        input.name = name
        input.value = value || ''
        input.placeholder = placeholder
        input.className = 'input-field'
        group.appendChild(input)
        return group
    }

    private handleAvatarChange(
        event: Event,
        imgPreview: HTMLImageElement
    ): void {
        const input = event.target as HTMLInputElement
        if (input.files && input.files[0]) {
            const reader = new FileReader()
            reader.onload = (e) => {
                imgPreview.src = e.target?.result as string
            }
            reader.readAsDataURL(input.files[0])
        }
    }

    private closeModal(): void {
        const overlay = this.container.querySelector('.modal-overlay')
        if (overlay) overlay.remove()
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)

        try {
            console.log('📤 Actualizando...', formData)
            await userController.updateProfile(formData)
            alert('¡Perfil actualizado!')
            this.closeModal()
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert('Error al actualizar')
        }
    }
}

export default UserSettingsComponent
