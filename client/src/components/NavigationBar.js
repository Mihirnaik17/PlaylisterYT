import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';

export default function NavigationBar() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    };

    const handleEditAccount = () => {
        handleMenuClose();
        history.push('/edit-account');
    };

    const handleHomeClick = () => {
        if (auth.isGuest) {
            history.push('/');
        } else if (auth.loggedIn) {
            history.push('/home');
        } else {
            history.push('/');
        }
    };

    return (
        <Box
            component="header"
            sx={{
                height: 72,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={handleHomeClick}
                    sx={{
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                        width: 40,
                        height: 40,
                    }}
                >
                    <HomeIcon />
                </IconButton>

                {(() => {
                    const path = location.pathname;
                    const isActive = (target) => path === target;
                    const navBtnSx = (active) => ({
                        px: 2.5,
                        borderRadius: 500,
                        ...(active
                            ? { bgcolor: 'primary.main', color: '#000', borderColor: 'primary.main', '&:hover': { bgcolor: 'secondary.main' } }
                            : { color: 'text.primary', borderColor: 'primary.main', '&:hover': { borderColor: 'secondary.main', bgcolor: 'rgba(255,255,255,0.06)' } }),
                    });

                    return (
                        <>
                            <Button
                                variant={isActive('/home') ? 'contained' : 'outlined'}
                                color={isActive('/home') ? 'primary' : 'inherit'}
                                onClick={() => history.push('/home')}
                                sx={navBtnSx(isActive('/home'))}
                            >
                                Playlists
                            </Button>

                            <Button
                                variant={isActive('/my-music') ? 'contained' : 'outlined'}
                                color={isActive('/my-music') ? 'primary' : 'inherit'}
                                onClick={() => history.push('/my-music')}
                                sx={navBtnSx(isActive('/my-music'))}
                            >
                                MY MUSIC
                            </Button>

                            <Button
                                variant={isActive('/songs') ? 'contained' : 'outlined'}
                                color={isActive('/songs') ? 'primary' : 'inherit'}
                                onClick={() => history.push('/songs')}
                                sx={navBtnSx(isActive('/songs'))}
                            >
                                Song Catalog
                            </Button>
                        </>
                    );
                })()}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.2 }}>
                The Playlister
            </Typography>

            <Box>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                    <Avatar
                        sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 44, height: 44 }}
                        src={auth.user?.avatar}
                    >
                        {auth.getUserInitials()}
                    </Avatar>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {auth.isGuest ? [
                        <MenuItem key="login" onClick={() => { handleMenuClose(); history.push('/login'); }}>
                            Login
                        </MenuItem>,
                        <MenuItem key="register" onClick={() => { handleMenuClose(); history.push('/register'); }}>
                            Create Account
                        </MenuItem>
                    ] : [
                        <MenuItem key="edit" onClick={handleEditAccount}>Edit Account</MenuItem>,
                        <MenuItem key="logout" onClick={handleLogout}>Logout</MenuItem>
                    ]}
                </Menu>
            </Box>
        </Box>
    );
}