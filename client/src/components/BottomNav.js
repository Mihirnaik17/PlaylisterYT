import { useHistory, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { usePlayerContext } from '../store/PlayerContext';

const NAV_ITEMS = [
    { label: 'Playlists', icon: <HomeIcon />, path: '/home' },
    { label: 'My Music', icon: <LibraryMusicIcon />, path: '/my-music' },
    { label: 'Catalog', icon: <QueueMusicIcon />, path: '/songs' },
];

const BOTTOM_NAV_HEIGHT = 56;

export { BOTTOM_NAV_HEIGHT };

export default function BottomNav() {
    const history = useHistory();
    const location = useLocation();
    const { session, modalOpen } = usePlayerContext();

    const hiddenPaths = ['/', '/login', '/login/', '/register', '/register/'];
    if (hiddenPaths.includes(location.pathname)) return null;

    const currentValue = NAV_ITEMS.find((item) => location.pathname === item.path)?.path ?? false;

    // Sits above MiniPlayer when active
    const bottomOffset = session && !modalOpen ? BOTTOM_NAV_HEIGHT + 80 : 0;

    return (
        <Box
            sx={{
                display: { xs: 'block', md: 'none' },
                position: 'fixed',
                bottom: bottomOffset,
                left: 0,
                right: 0,
                zIndex: 1299,
                borderTop: '1px solid rgba(255,255,255,0.08)',
                transition: 'bottom 0.2s ease',
            }}
        >
            <BottomNavigation
                value={currentValue}
                onChange={(_, newPath) => history.push(newPath)}
                sx={{
                    bgcolor: '#0d0d0d',
                    height: BOTTOM_NAV_HEIGHT,
                    '& .MuiBottomNavigationAction-root': {
                        color: 'rgba(255,255,255,0.45)',
                        minWidth: 'auto',
                        '&.Mui-selected': { color: '#1DB954' },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.7rem',
                        '&.Mui-selected': { fontSize: '0.7rem', fontWeight: 700 },
                    },
                }}
            >
                {NAV_ITEMS.map(({ label, icon, path }) => (
                    <BottomNavigationAction key={path} label={label} icon={icon} value={path} />
                ))}
            </BottomNavigation>
        </Box>
    );
}
