// export default function SplashScreen() {
//     return (
//         <div id="splash-screen">
//             Playlister
//         </div>
//     )
// }

import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function SplashScreen() {
    const history = useHistory();

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FFFACD',
                position: 'fixed',
                top: 0,
                left: 0,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60px',
                    bgcolor: '#FF00FF', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2
                }}
            >
                <Box sx={{ color: 'white', fontSize: '24px' }}>🏠</Box>
                <Box sx={{ color: 'white', fontSize: '24px', cursor: 'pointer' }}>👤</Box>
            </Box>

            <Typography 
                variant="h2" 
                sx={{ 
                    mb: 4,
                    fontWeight: 500,
                    color: '#333'
                }}
            >
                The Playlister
            </Typography>

            <Box
                sx={{
                    fontSize: '120px',
                    mb: 6,
                }}
            >
                🎵
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => history.push('/')} 
                    sx={{
                        bgcolor: '#333',
                        color: '#fff',
                        '&:hover': { bgcolor: '#555' },
                        textTransform: 'none',
                        px: 3,
                        py: 1
                    }}
                >
                    Continue as Guest
                </Button>

                <Button
                    variant="contained"
                    onClick={() => history.push('/login')}
                    sx={{
                        bgcolor: '#333',
                        color: '#fff',
                        '&:hover': { bgcolor: '#555' },
                        textTransform: 'none',
                        px: 3,
                        py: 1
                    }}
                >
                    Login
                </Button>

                <Button
                    variant="contained"
                    onClick={() => history.push('/register')}
                    sx={{
                        bgcolor: '#333',
                        color: '#fff',
                        '&:hover': { bgcolor: '#555' },
                        textTransform: 'none',
                        px: 3,
                        py: 1
                    }}
                >
                    Create Account
                </Button>
            </Box>
        </Box>
    );
}