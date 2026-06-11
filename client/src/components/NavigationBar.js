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
                    height: 64,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    bgcolor: '#121212',
                    flexShrink: 0,
                    gap: 1.5,
                }}
            >
                {auth.loggedIn && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#fff' }}>
                                {auth.user?.username || `${auth.user?.firstName} ${auth.user?.lastName}`}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
                                {auth.user?.email}
                            </Typography>
                        </Box>
                        <Avatar
                            sx={{ bgcolor: 'secondary.main', color: '#000', width: 38, height: 38, fontWeight: 700 }}
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
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
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
