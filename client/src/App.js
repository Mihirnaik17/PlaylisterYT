import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
    HomeWrapper,
    LoginScreen,
    RegisterScreen,
    SplashScreen,
    Statusbar,
    WorkspaceScreen,
    SongsCatalogScreen,
    EditAccountScreen,
    MyMusicScreen
} from './components'

export const spotifyTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#181818',
        },
        primary: {
            main: '#1DB954',
            contrastText: '#000000',
        },
        secondary: {
            main: '#1ED760',
        },
        error: {
            main: '#f44336',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B3B3B3',
        },
        divider: 'rgba(255,255,255,0.1)',
        action: {
            hover: 'rgba(255,255,255,0.08)',
        },
    },
    typography: {
        fontFamily: '"Circular", "Helvetica Neue", Helvetica, Arial, sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { fontWeight: 700, letterSpacing: '0.05em' },
    },
    shape: { borderRadius: 4 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: '#121212' },
                '*::-webkit-scrollbar': { width: '6px' },
                '*::-webkit-scrollbar-track': { background: '#121212' },
                '*::-webkit-scrollbar-thumb': {
                    background: '#535353',
                    borderRadius: '3px',
                },
                '*::-webkit-scrollbar-thumb:hover': { background: '#1DB954' },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 500, textTransform: 'none', fontWeight: 700 },
                contained: {
                    '&:hover': { transform: 'scale(1.04)', transition: 'transform .1s' },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#2a2a2a',
                        '&:hover fieldset': { borderColor: '#1DB954' },
                        '&.Mui-focused fieldset': { borderColor: '#1DB954' },
                    },
                    '& label.Mui-focused': { color: '#1DB954' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600 },
                colorPrimary: { backgroundColor: '#1DB954', color: '#000' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
        MuiSelect: {
            styleOverrides: {
                icon: { color: '#B3B3B3' },
            },
        },
    },
});

const App = () => {
    return (
        <ThemeProvider theme={spotifyTheme}>
            <CssBaseline />
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
                            <Route path="/my-music" exact component={MyMusicScreen} />
                            <Route path="/edit-account" exact component={EditAccountScreen} />
                        </Switch>
                        <Route path="/home" exact component={Statusbar} />
                        <Route path="/playlist/:id" exact component={Statusbar} />
                    </GlobalStoreContextProvider>
                </AuthContextProvider>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
