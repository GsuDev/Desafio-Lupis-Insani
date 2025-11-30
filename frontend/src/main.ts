import AccessContainer from './components/accessContainer/AccessContainer'
import UserProfileContainer from './components/userProfileContainer/userProfileContainer'
import { userController } from './controllers/UserController'
import './style.css'

const app = document.getElementById('app')

if (app) {
    if (userController.isLoggedIn) {
        const userProfileContainer = new UserProfileContainer(app)
        userProfileContainer.render()
    } else {
        const accessContainer = new AccessContainer(app)
        accessContainer.render()
    }
}
