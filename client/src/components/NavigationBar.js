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
        if (auth.loggedIn || auth.isGuest) {
            history.push('/');
        } else {
            history.push('/');
        }
    };

    return (
        <Box
            sx={{
                height: '80px',
                bgcolor: '#FF00FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={handleHomeClick}
                    sx={{
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#f0f0f0' },
                        width: 40,
                        height: 40
                    }}
                >
                    <HomeIcon />
                </IconButton>

                <Button
                    variant="contained"
                    onClick={() => history.push('/playlists')}
                    sx={{
                        bgcolor: '#333',
                        color: '#fff',
                        '&:hover': { bgcolor: '#555' },
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Playlists
                </Button>

                <Button
                    variant="contained"
                    onClick={() => history.push('/songs')}
                    sx={{
                        bgcolor: '#1976d2',
                        color: '#fff',
                        '&:hover': { bgcolor: '#1565c0' },
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Song Catalog
                </Button>
            </Box>

            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                The Playlister
            </Typography>

            <Box>
                <IconButton onClick={handleMenuOpen}>
                    <Avatar
                        sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}
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
                    <MenuItem onClick={handleEditAccount}>Edit Account</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}