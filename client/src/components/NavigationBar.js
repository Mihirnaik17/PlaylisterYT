import { useContext, useState } from 'react';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsModal from './SettingsModal';

export default function NavigationBar() {
    const { auth } = useContext(AuthContext);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <Box
                component="header"
                sx={{
                    height: { xs: 56, md: 64 },
                    px: { xs: 2, md: 3 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    bgcolor: '#121212',
                    flexShrink: 0,
                    gap: 1.5,
                }}
            >
                {/* Logo — only shown on mobile where the sidebar is hidden */}
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/ytapp-logo.png"
                        alt="PlaylisterYT"
                        sx={{ width: 28, height: 28, borderRadius: 0.5, objectFit: 'contain' }}
                    />
                    <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem', letterSpacing: '-0.3px' }}>
                        PlaylisterYT
                    </Typography>
                </Box>

                {/* Spacer on desktop (logo lives in sidebar) */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1 }} />

                {/* Right side: user info + settings */}
                {auth.loggedIn && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Email hidden on small screens to save space */}
                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>
                                {auth.user?.username || `${auth.user?.firstName} ${auth.user?.lastName}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                {auth.user?.email}
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{ bgcolor: 'secondary.main', color: '#000', width: { xs: 32, md: 38 }, height: { xs: 32, md: 38 }, fontWeight: 700, fontSize: { xs: '0.85rem', md: '1rem' } }}
                            src={auth.user?.avatar}
                        >
                            {auth.getUserInitials()}
                        </Avatar>
                        <Tooltip title="Account settings">
                            <IconButton
                                onClick={() => setSettingsOpen(true)}
                                sx={{ color: 'rgba(255,255,255,0.55)', '&:hover': { color: '#fff' } }}
                                size="small"
                            >
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {auth.isGuest && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                        Listening as guest
                    </Typography>
                )}
            </Box>

            {auth.loggedIn && (
                <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            )}
        </>
    );
}
