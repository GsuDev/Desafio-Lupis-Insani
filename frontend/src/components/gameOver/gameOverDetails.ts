
import './gameOverDetails.css';
import UserProfileContainer from '../userProfileContainer/userProfileContainer';
import logo from '../../assets/icons/lupis-insani.png'
import { gameController } from '../../controllers/GameController';
//datos que se envian desde el back
export interface GameOverData {
    winner: 'wolves' | 'villagers' | null;
    alive_wolves: number;
    alive_villagers: number;
    reason: string; // El mensaje de contexto (ej: "Todos los lobos han muerto")
    
}

export class GameOverDetails {
    private data: GameOverData;
    private container: HTMLElement;

    constructor(data: GameOverData) {
        this.data = data;
        
        this.container = document.createElement('div');
        this.container.classList.add('game-over-details');
    }

    public render(): HTMLElement {
        
        this.container.innerHTML = '';

        this.renderLogo();

        
        this.renderTitle();

        
        this.renderReason();

        
        this.renderStats();

       
        this.renderButtons();

        return this.container;
    }

    private renderLogo(): void {
        const logoContainer = document.createElement('div');
        logoContainer.classList.add('game-over-logo-container');

        const img = document.createElement('img');
        img.src = logo;
        img.alt = 'Lupis Insani Logo';
        img.classList.add('game-over-logo');

        logoContainer.appendChild(img);
        this.container.appendChild(logoContainer);
    }

    private renderTitle(): void {
        const title = document.createElement('h1');
        title.classList.add('game-over-title');

        if (this.data.winner === 'villagers') {
            title.textContent = '¡VICTORIA DE LOS ALDEANOS!';
            title.classList.add('text-villagers');
        } else if (this.data.winner === 'wolves') {
            title.textContent = '¡VICTORIA DE LOS HOMBRES LOBO!';
            title.classList.add('text-wolves'); 
        } else {
            title.textContent = 'PARTIDA FINALIZADA';
        }

        this.container.appendChild(title);
    }

    private renderReason(): void {
        const p = document.createElement('p');
        p.classList.add('game-over-reason');
        p.textContent = this.data.reason;
        this.container.appendChild(p);
    }

    private renderStats(): void {
        const statsBox = document.createElement('div');
        statsBox.classList.add('game-over-stats');

        statsBox.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">🐺 Lobos vivos:</span>
                <span class="stat-value">${this.data.alive_wolves}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">👱 Aldeanos vivos:</span>
                <span class="stat-value">${this.data.alive_villagers}</span>
            </div>
        `;

        this.container.appendChild(statsBox);
    }

    private renderButtons(): void {
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('game-over-buttons');

        
        const btnProfile = document.createElement('button');
        btnProfile.textContent = 'Ir al Perfil';
        btnProfile.className = 'btn btn-primary';
        btnProfile.onclick = () => this.handleGoToProfile();

        buttonGroup.appendChild(btnProfile);

        this.container.appendChild(buttonGroup);
    }

    

    private handleGoToProfile(): void {
        gameController.disconnectGameChannel()
        gameController.disconnectWolvesChannel()
        const app = document.getElementById('app');
        if (!app) {
            console.error('❌ No se encontró el contenedor #app');
            return;
        }
        app.innerHTML = '';

        const profile = new UserProfileContainer(app);

        profile.render();

    }
}