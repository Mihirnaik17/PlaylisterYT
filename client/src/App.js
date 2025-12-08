import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import {
    HomeWrapper,
    LoginScreen,
    RegisterScreen,
    SplashScreen,
    Statusbar,
    WorkspaceScreen,
    SongsCatalogScreen,
    EditAccountScreen
} from './components'
/*
  This is the entry-point for our application. Notice that we
  inject our store into all the components in our application.
  
  @author McKilla Gorilla
*/
const App = () => {   
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>              
                    <Switch>
                        <Route path="/" exact component={SplashScreen} />
                        <Route path="/home" exact component={HomeWrapper} />
                        <Route path="/login/" exact component={LoginScreen} />
                        <Route path="/register/" exact component={RegisterScreen} />
                        <Route path="/playlist/:id" exact component={WorkspaceScreen} />
                        <Route path="/songs" exact component={SongsCatalogScreen} />
                        <Route path="/edit-account" exact component={EditAccountScreen} />
                    </Switch>
                    <Route path="/home" exact component={Statusbar} />
                    <Route path="/playlist/:id" exact component={Statusbar} />
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default App
