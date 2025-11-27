import { GameChannel } from './channels/GameChannel'
import { WolvesChannel } from './channels/WolvesChannel'
import { GameChat } from './components/gameChat/gameChat'
import { userController } from './controllers/UserController'

// Estado global
let gameChannel: GameChannel | null = null
let wolvesChannel: WolvesChannel | null = null
const gameId = 1
const userId = 'test-user-1' // En prod vendría del user autenticado
const playerName = 'Juan' // En prod vendría del perfil del usuario

// Login
userController.login('user@example.com', 'password')

function createUI(): void {
    const container = document.createElement('div')
    container.id = 'app-container'
    container.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        padding: 20px;
        height: 100vh;
        background: #f5f5f5;
    `

    // Panel izquierdo: Control de canales
    const controlPanel = document.createElement('div')
    controlPanel.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        overflow-y: auto;
    `

    controlPanel.innerHTML = `
        <h1>🎮 Control Panel</h1>
        
        <div style="margin-bottom: 20px;">
            <h3>📡 Canales</h3>
            <button id="connectGame" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">✅ Conectar Game Channel</button>
            
            <button id="disconnectGame" disabled style="
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">❌ Desconectar Game</button>

            <button id="connectWolves" style="
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">✅ Conectar Wolves Channel</button>
            
            <button id="disconnectWolves" disabled style="
                width: 100%;
                padding: 10px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            ">❌ Desconectar Wolves</button>
        </div>

        <div id="status" style="
            background: #e3f2fd;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        ">
            <h3 style="margin-top: 0;">Estado</h3>
            <p>🎮 Game: <span id="gameStatus" style="color: #f44336;">Desconectado</span></p>
            <p>🐺 Wolves: <span id="wolvesStatus" style="color: #f44336;">Desconectado</span></p>
        </div>

        <div>
            <h3>📋 Log</h3>
            <div id="log" style="
                background: #1e1e1e;
                color: #00ff00;
                padding: 10px;
                border-radius: 4px;
                height: 300px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
            "></div>
            <button id="clearLog" style="
                width: 100%;
                margin-top: 10px;
                padding: 8px;
                background: #757575;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">🗑️ Limpiar Log</button>
        </div>
    `

    // Panel derecho: Chat
    const chatPanel = document.createElement('div')
    chatPanel.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
    `

    // Inicializar ChatController e insertar su UI

    const chatUI = new GameChat(chatPanel, true)
    chatUI.render()

    container.appendChild(controlPanel)
    container.appendChild(chatPanel)
    document.body.appendChild(container)
    document.body.style.margin = '0'
}

function addLog(
    msg: string,
    type: 'info' | 'success' | 'error' = 'info'
): void {
    const log = document.getElementById('log')
    if (!log) return

    const colors: Record<string, string> = {
        info: '#00ff00',
        success: '#00ff00',
        error: '#ff4444',
    }

    const div = document.createElement('div')
    const time = new Date().toLocaleTimeString()
    div.style.color = colors[type]
    div.textContent = `[${time}] ${msg}`
    log.appendChild(div)
    log.scrollTop = log.scrollHeight
}

function connectGameChannel(): void {
    try {
        gameChannel = new GameChannel(gameId)
        const btn = document.getElementById('connectGame') as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectGame'
        ) as HTMLButtonElement
        btn.disabled = true
        disconnectBtn.disabled = false

        const status = document.getElementById('gameStatus')
        if (status) {
            status.textContent = '✅ Conectado'
            status.style.color = '#4CAF50'
        }

        addLog(`✅ Game Channel conectado`, 'success')
    } catch (error) {
        addLog(`❌ Error: ${error}`, 'error')
    }
}

function disconnectGameChannel(): void {
    try {
        if (gameChannel) {
            gameChannel.leave()
            gameChannel = null
        }
        const btn = document.getElementById('connectGame') as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectGame'
        ) as HTMLButtonElement
        btn.disabled = false
        disconnectBtn.disabled = true

        const status = document.getElementById('gameStatus')
        if (status) {
            status.textContent = '❌ Desconectado'
            status.style.color = '#f44336'
        }

        addLog('👋 Game Channel desconectado', 'info')
    } catch (error) {
        addLog(`❌ Error: ${error}`, 'error')
    }
}

function connectWolvesChannel(): void {
    try {
        wolvesChannel = new WolvesChannel(gameId)
        const btn = document.getElementById(
            'connectWolves'
        ) as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectWolves'
        ) as HTMLButtonElement
        btn.disabled = true
        disconnectBtn.disabled = false

        const status = document.getElementById('wolvesStatus')
        if (status) {
            status.textContent = '✅ Conectado'
            status.style.color = '#4CAF50'
        }

        addLog(`✅ Wolves Channel conectado`, 'success')
    } catch (error) {
        addLog(`❌ Error: ${error}`, 'error')
    }
}

function disconnectWolvesChannel(): void {
    try {
        if (wolvesChannel) {
            wolvesChannel.leave()
            wolvesChannel = null
        }
        const btn = document.getElementById(
            'connectWolves'
        ) as HTMLButtonElement
        const disconnectBtn = document.getElementById(
            'disconnectWolves'
        ) as HTMLButtonElement
        btn.disabled = false
        disconnectBtn.disabled = true

        const status = document.getElementById('wolvesStatus')
        if (status) {
            status.textContent = '❌ Desconectado'
            status.style.color = '#f44336'
        }

        addLog('👋 Wolves Channel desconectado', 'info')
    } catch (error) {
        addLog(`❌ Error: ${error}`, 'error')
    }
}

function init(): void {
    createUI()

    document
        .getElementById('connectGame')
        ?.addEventListener('click', connectGameChannel)
    document
        .getElementById('disconnectGame')
        ?.addEventListener('click', disconnectGameChannel)
    document
        .getElementById('connectWolves')
        ?.addEventListener('click', connectWolvesChannel)
    document
        .getElementById('disconnectWolves')
        ?.addEventListener('click', disconnectWolvesChannel)
    document.getElementById('clearLog')?.addEventListener('click', () => {
        const log = document.getElementById('log')
        if (log) log.innerHTML = ''
    })

    addLog('🚀 App initialized', 'success')
    addLog('Conecta los canales y escribe mensajes', 'info')
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
