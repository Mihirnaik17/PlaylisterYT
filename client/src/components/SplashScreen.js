// export default function SplashScreen() {
//     return (
//         <div id="splash-screen">
//             Playlister
//         </div>
//     )
// }

import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';



export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                px: 2,
                py: 6,
            }}
        >
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, textAlign: 'center' }}>
                The Playlister
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 520, textAlign: 'center' }}>
                Build playlists, explore the catalog, and let AI suggest tracks that match your mood.
            </Typography>

            <Box
                sx={{
                    fontSize: '96px',
                    mb: 4,
                    filter: 'drop-shadow(0 12px 40px rgba(167, 139, 250, 0.35))',
                }}
            >
                🎵
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" color="primary" size="large" onClick={() => auth.continueAsGuest()}>
                    Continue as Guest
                </Button>

                <Button variant="outlined" color="secondary" size="large" onClick={() => history.push('/login')}>
                    Login
                </Button>

                <Button variant="outlined" color="primary" size="large" onClick={() => history.push('/register')}>
                    Create Account
                </Button>
            </Box>
        </Box>
    );
}
