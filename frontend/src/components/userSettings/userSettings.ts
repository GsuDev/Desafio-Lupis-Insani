
import './userSettings.css'

import { userController } from '../../controllers/UserController'

import type { User } from '../../models/User'


export class UserSettingsComponent {
    // aqui guardamos el contenedor donde vamos a pintar nuestro componente
    private container: HTMLElement
    
    private userData: User

   
    constructor(container: HTMLElement) {
        this.container = container
        // pillamos el usuario actual del controlador
        const currentUser = userController.currentUser
        
        if (currentUser) {
            
            this.userData = currentUser
        } else {
            //este caso nunca se va a dar pero si no lo ponga TS me da error
            this.userData = {
                id: 0,
                nickname: '',
                name: '',
                lastname: '',
                email: '',
                birthdate: '',
                profile_url: undefined
            } 
        }
    }

    //  para pintar el html en la pantalla
    render(): void {
        //  overlayfondo oscuro que tapa el resto de la web
        const overlay = document.createElement('div')
        overlay.className = 'modal-overlay'
        // si hacen click en el fondo oscuro y no en la tarjeta cerramos el modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal()
        })

        // aqui es donde va todo el contenido del modal
        const card = document.createElement('div')
        card.className = 'user-settings-card'

        
        const header = document.createElement('header')
        header.className = 'settings-header'

        // boton para volver para atras
        const backBtn = document.createElement('button')
        backBtn.className = 'back-btn'
        backBtn.innerHTML = '&#8592;' 
        backBtn.onclick = () => this.closeModal()

        // titulo del modal
        const title = document.createElement('h2')
        title.className = 'settings-title'
        title.textContent = 'EDITAR PERFIL'

        // espacio para que el titulo se quede centrado
        const spacer = document.createElement('div')
        spacer.style.width = '30px' 

        // metemos todo en el header
        header.append(backBtn, title, spacer)

        // formulario
        
        const form = document.createElement('form')
        form.className = 'settings-form'
        // Cuando se envíe el formulario, llamamos a handleSubmit
        form.onsubmit = (e) => this.handleSubmit(e)

        // avatar y datos personales basicos
        const topSection = document.createElement('div')
        topSection.className = 'top-section'

        // columna para la foto de perfil avatar
        const avatarCol = document.createElement('div')
        avatarCol.className = 'avatar-col'
        const avatarImg = document.createElement('img')
        // Si tiene foto la ponemos, si no, usamos una de un bot aleatorio esto es temporal se cambiara
        avatarImg.src = this.userData.profile_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${this.userData.nickname}`
        avatarImg.className = 'avatar-circle'
        
        // input invisible para subir archivos
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = 'image/*' // solo imágenes
        fileInput.hidden = true
        // Cuando cambie (se seleccione archivo), actualizamos la previsualización
        fileInput.onchange = (e) => this.handleAvatarChange(e, avatarImg)
        
        // si hacen click en la imagen simulamos click en el input de archivo
        avatarImg.onclick = () => fileInput.click()
        avatarCol.append(avatarImg, fileInput)

        // columna con la información de texto nick nombre y apellidos
        const infoCol = document.createElement('div')
        infoCol.className = 'info-col'
        
        // se crea el input para el nickname usando nuestro método helper
        const nickGroup = this.createInput(null, 'nickname', 'text', this.userData.nickname, 'Nickname')
        
        // fila para Nombre y Apellidos juntos
        const nameRow = document.createElement('div')
        nameRow.className = 'name-row'
        const nameGroup = this.createInput(null, 'name', 'text', this.userData.name, 'Nombre')
        const lastnameGroup = this.createInput(null, 'lastname', 'text', this.userData.lastname, 'Apellidos')
        nameRow.append(nameGroup, lastnameGroup)

        // columna de info
        infoCol.append(nickGroup, nameRow)
        // las dos columnas a la sección superior
        topSection.append(avatarCol, infoCol)

        // email, fecha nacimiento, contraseña
        const emailGroup = this.createInput(null, 'email', 'email', this.userData.email, 'Correo Electrónico')
        
        // se formatea la fecha para que el input type="date" la entienda (yyyy-mm-dd) y no nos la lie
        const rawDate = this.userData.birthdate || '';
        const cleanDate = rawDate.split('T')[0];
        const birthGroup = this.createInput(null, 'birthdate', 'date', cleanDate, 'Fecha Nacimiento')

        // btn para cambiar contraseña
        const changePassBtn = document.createElement('button')
        changePassBtn.type = 'button' // tyoe button para que no envíe el formulario
        changePassBtn.className = 'btn-change-pass'
        changePassBtn.textContent = '🔒 Cambiar contraseña'
        changePassBtn.onclick = () => console.log('Abrir modal contraseña') 

        // añadimos todo al formulario
        form.append(topSection, emailGroup, birthGroup, changePassBtn)

        // footer
        // pie del modal con los botones 
        const footer = document.createElement('footer')
        footer.className = 'settings-footer'

        // btn cancelar
        const cancelBtn = document.createElement('button')
        cancelBtn.type = 'button'
        cancelBtn.className = 'btn-cancel'
        cancelBtn.textContent = 'Cancelar'
        cancelBtn.onclick = () => this.closeModal()

        // btn
        const saveBtn = document.createElement('button')
        saveBtn.className = 'btn-save'
        saveBtn.textContent = 'Actualizar datos'
        // se fuerza el envio del formulario
        saveBtn.onclick = () => form.requestSubmit() 

        footer.append(cancelBtn, saveBtn)

        // Ensamblado final se mete todo en la tarjeta, la tarjeta en el overlay, y el overlay en el contenedor
        card.append(header, form, footer)
        overlay.appendChild(card)
        this.container.appendChild(overlay)
    }

    // metodo helper para crear inputs sin repetir código a lo loco
    private createInput(label: string | null, name: string, type: string, value: string, placeholder: string): HTMLDivElement {
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

    // maneja el cambio de imagen cuando seleccionamos un archivo
    private handleAvatarChange(event: Event, imgPreview: HTMLImageElement): void {
        const input = event.target as HTMLInputElement
        if (input.files && input.files[0]) {
            // Usamos FileReader para leer el archivo y mostrarlo antes de subirlo
            const reader = new FileReader()
            reader.onload = (e) => { imgPreview.src = e.target?.result as string }
            reader.readAsDataURL(input.files[0])
        }
    }

    // cierra el modal eliminandolo del dom
    private closeModal(): void {
        const overlay = this.container.querySelector('.modal-overlay')
        if (overlay) overlay.remove()
    }

    // manejo envio formulario
    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault() 
        const form = e.target as HTMLFormElement
        const formData = new FormData(form)
        // Convertimos los datos del formulario a un objeto
        const formValues = Object.fromEntries(formData.entries()) as unknown as Partial<User>

        
            // Llamamos al controlador para actualizar (es asíncrono, así que await)
            await userController.updateProfile(formValues)
            this.closeModal()
            window.location.reload() // Recargamos para ver los cambios un poco bruto pero por el momento funciona
        
    }
}

export default UserSettingsComponent