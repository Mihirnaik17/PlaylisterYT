import { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AIRecommendationsDialog from './AIRecommendationsDialog';

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
    { label: 'Playlists', icon: <HomeIcon />, path: '/home' },
    { label: 'My Music', icon: <LibraryMusicIcon />, path: '/my-music' },
    { label: 'Song Catalog', icon: <QueueMusicIcon />, path: '/songs' },
];

export default function Sidebar() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const location = useLocation();
    const [aiOpen, setAiOpen] = useState(false);

    return (
        <Box
            sx={{
                width: SIDEBAR_WIDTH,
                flexShrink: 0,
                height: '100vh',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                bgcolor: '#0d0d0d',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                py: 2,
                overflowX: 'hidden',
            }}
        >
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, mb: 3.5 }}>
                <Box
                    component="img"
                    src="/assets/ytapp-logo.png"
                    alt="PlaylisterYT"
                    sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'contain' }}
                />
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}
                >
                    PlaylisterYT
                </Typography>
            </Box>

            {/* Nav items */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.5 }}>
                {NAV_ITEMS.map(({ label, icon, path }) => {
                    const active = location.pathname === path;
                    return (
                        <Box
                            key={path}
                            onClick={() => history.push(path)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                px: 1.5,
                                py: 1.1,
                                borderRadius: 2,
                                cursor: 'pointer',
                                bgcolor: active ? 'rgba(29,185,84,0.15)' : 'transparent',
                                color: active ? '#1DB954' : 'rgba(255,255,255,0.65)',
                                transition: 'all 0.15s',
                                '&:hover': {
                                    bgcolor: active ? 'rgba(29,185,84,0.18)' : 'rgba(255,255,255,0.07)',
                                    color: active ? '#1DB954' : '#fff',
                                },
                                '& .MuiSvgIcon-root': {
                                    fontSize: 21,
                                },
                            }}
                        >
                            {icon}
                            <Typography variant="body2" sx={{ fontWeight: active ? 700 : 500, fontSize: '0.875rem' }}>
                                {label}
                            </Typography>
                        </Box>
                    );
                })}

                {auth.loggedIn && (
                    <Box sx={{ mt: 1, px: 1 }}>
                        <Tooltip title="AI song recommendations" placement="right">
                            <IconButton
                                onClick={() => setAiOpen(true)}
                                sx={{
                                    color: 'rgba(255,255,255,0.45)',
                                    borderRadius: 2,
                                    '&:hover': { color: '#1DB954', bgcolor: 'rgba(29,185,84,0.12)' },
                                }}
                            >
                                <AutoAwesomeIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <AIRecommendationsDialog open={aiOpen} onClose={() => setAiOpen(false)} playlistContext={[]} />
                    </Box>
                )}
            </Box>

            {/* Bottom: logout / auth actions */}
            <Box sx={{ px: 1.5, pb: 1 }}>
                {auth.isGuest ? (
                    <>
                        <Box
                            onClick={() => history.push('/login')}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 1.5, py: 1.1, borderRadius: 2, cursor: 'pointer',
                                color: 'rgba(255,255,255,0.55)',
                                transition: 'all 0.15s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: '#fff' },
                                '& .MuiSvgIcon-root': { fontSize: 21 },
                            }}
                        >
                            <LoginIcon />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Login</Typography>
                        </Box>
                        <Box
                            onClick={() => history.push('/register')}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 1.5, py: 1.1, borderRadius: 2, cursor: 'pointer',
                                color: 'rgba(255,255,255,0.55)',
                                transition: 'all 0.15s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: '#fff' },
                                '& .MuiSvgIcon-root': { fontSize: 21 },
                            }}
                        >
                            <PersonAddIcon />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Create Account</Typography>
                        </Box>
                    </>
                ) : auth.loggedIn ? (
                    <Tooltip title="Logout" placement="right">
                        <Box
                            onClick={() => auth.logoutUser()}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                px: 1.5, py: 1.1, borderRadius: 2, cursor: 'pointer',
                                color: 'rgba(255,255,255,0.55)',
                                transition: 'all 0.15s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', color: '#f44336' },
                                '& .MuiSvgIcon-root': { fontSize: 21 },
                            }}
                        >
                            <LogoutIcon />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Logout</Typography>
                        </Box>
                    </Tooltip>
                ) : null}
            </Box>
        </Box>
    );
}
