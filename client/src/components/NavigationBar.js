import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
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

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => history.push('/home')}
                    sx={{ px: 2.5 }}
                >
                    Playlists
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => history.push('/songs')}
                    sx={{ px: 2.5 }}
                >
                    Song Catalog
                </Button>
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