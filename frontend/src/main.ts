import AccessContainer from './components/accessContainer/AccessContainer'
import './style.css'

const app = document.getElementById('app')

if (app) {
    const accessContainer = new AccessContainer(app)
    accessContainer.render()
}
