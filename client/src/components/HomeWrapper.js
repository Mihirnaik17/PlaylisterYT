import { useContext } from 'react'
import { Redirect } from 'react-router-dom'
import HomeScreen from './HomeScreen'
import AuthContext from '../auth'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);

    if (!auth.authReady) return null;
    if (auth.loggedIn || auth.isGuest) return <HomeScreen />
    return <Redirect to="/" />
}
