import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';

const KEYFRAMES = `
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulseGreen {
  0%, 100% { box-shadow: 0 0 0 0 rgba(29,185,84,0.5); transform: scale(1); }
  50%       { box-shadow: 0 0 0 30px rgba(29,185,84,0); transform: scale(1.07); }
}
@keyframes waveRing {
  0%   { transform: scale(1);   opacity: 0.5; }
  100% { transform: scale(2.6); opacity: 0; }
}
`;

export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    return (
        <>
            <style>{KEYFRAMES}</style>

            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(ellipse at 50% 0%, #1a3a28 0%, #121212 60%)',
                    position: 'relative',
                    overflow: 'hidden',
                    gap: 0,
                    px: 2,
                }}
            >
                {/* Animated background rings */}
                {[1.2, 2.0, 2.8].map((delay, i) => (
                    <Box
                        key={i}
                        sx={{
                            position: 'absolute',
                            width: 140,
                            height: 140,
                            borderRadius: '50%',
                            border: '1px solid rgba(29,185,84,0.2)',
                            animation: `waveRing 3.6s ${delay}s ease-out infinite`,
                            pointerEvents: 'none',
                        }}
                    />
                ))}

                {/* Logo placeholder — swap the icon for <img src="/logo.png" /> when your logo is ready */}
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: '#1DB954',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulseGreen 2.8s ease-in-out infinite, fadeInDown 0.7s ease both',
                        mb: 3,
                        zIndex: 1,
                    }}
                >
                    <MusicNoteIcon sx={{ fontSize: 64, color: '#000' }} />
                </Box>

                {/* App name */}
                <Typography
                    variant="h2"
                    sx={{
                        color: '#FFFFFF',
                        fontWeight: 900,
                        letterSpacing: '-1px',
                        mb: 0.5,
                        animation: 'fadeInDown 0.7s 0.15s ease both',
                        opacity: 0,
                        zIndex: 1,
                        textAlign: 'center',
                    }}
                >
                    The Playlister
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: '#B3B3B3',
                        mb: 5,
                        animation: 'fadeInDown 0.7s 0.28s ease both',
                        opacity: 0,
                        zIndex: 1,
                        textAlign: 'center',
                    }}
                >
                    Music. Curated by you — and AI.
                </Typography>

                {/* Stacked action buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        animation: 'fadeInUp 0.7s 0.4s ease both',
                        opacity: 0,
                        zIndex: 1,
                    }}
                >
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<MusicNoteIcon />}
                        onClick={() => auth.continueAsGuest()}
                        sx={{
                            bgcolor: '#1DB954',
                            color: '#000',
                            px: 6,
                            py: 1.8,
                            fontSize: '1rem',
                            fontWeight: 900,
                            borderRadius: 500,
                            width: 280,
                            '&:hover': {
                                bgcolor: '#1ed760',
                                boxShadow: '0 8px 30px rgba(29,185,84,0.5)',
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        Listen as Guest
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PersonIcon />}
                        onClick={() => history.push('/login')}
                        sx={{
                            borderColor: 'rgba(255,255,255,0.6)',
                            color: '#FFFFFF',
                            px: 6,
                            py: 1.8,
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: 500,
                            width: 280,
                            '&:hover': {
                                borderColor: '#FFFFFF',
                                bgcolor: 'rgba(255,255,255,0.08)',
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        Login
                    </Button>

                    <Button
                        variant="text"
                        size="small"
                        onClick={() => history.push('/register')}
                        sx={{
                            color: '#B3B3B3',
                            fontWeight: 400,
                            mt: 0.5,
                            textDecoration: 'underline',
                            '&:hover': { color: '#fff', bgcolor: 'transparent' },
                        }}
                    >
                        Don't have an account? Sign up free
                    </Button>
                </Box>

                {/* Bottom vignette */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 100,
                        background: 'linear-gradient(to top, #121212, transparent)',
                        pointerEvents: 'none',
                    }}
                />
            </Box>
        </>
    );
}
