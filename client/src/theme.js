import { createTheme } from '@mui/material/styles';

const playlisterDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#a78bfa',
            light: '#c4b5fd',
            dark: '#7c3aed',
            contrastText: '#0f172a',
        },
        secondary: {
            main: '#22d3ee',
            dark: '#0891b2',
            contrastText: '#0f172a',
        },
        background: {
            default: '#0b1020',
            paper: '#12182b',
        },
        divider: 'rgba(148, 163, 184, 0.18)',
        text: {
            primary: '#e2e8f0',
            secondary: '#94a3b8',
        },
        success: { main: '#34d399' },
        error: { main: '#f87171' },
        warning: { main: '#fbbf24' },
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily: '"Lexend Exa", "Roboto", "Helvetica Neue", Arial, sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
    },
});

export default playlisterDarkTheme;
