import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import MUIErrorModal from './MUIErrorModal';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();

    const [username, setUsername] = useState(auth.user?.username || '');
    const [email] = useState(auth.user?.email || '');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [avatarImage, setAvatarImage] = useState(undefined);

    const handleHomeClick = () => {
        history.push('/home');
    };

    const handleAvatarSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await auth.editUser(username, password, passwordVerify, avatarImage);
    };

    const handleCancel = () => {
        history.push('/home');
    };

    let modalJSX = "";
    if (auth.errorMessage !== null){
        modalJSX = <MUIErrorModal />;
    }

    return (
        <Box sx={{ height: '100vh', bgcolor: '#f0e6f6' }}>
            <Box
                sx={{
                    height: '60px',
                    bgcolor: '#FF00FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2
                }}
            >
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
                <Avatar
                    sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}
                    src={avatarImage || auth.user?.avatar}
                >
                    {auth.getUserInitials()}
                </Avatar>
            </Box>

            <Container component="main" maxWidth="md">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: '#FFFACD',
                        padding: 4,
                        borderRadius: 2,
                        border: '2px solid #000'
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Edit Account
                    </Typography>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                            gap: 4
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Avatar
                                sx={{ bgcolor: '#1976d2', width: 72, height: 72 }}
                                src={avatarImage || auth.user?.avatar}
                            >
                                {auth.getUserInitials()}
                            </Avatar>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{
                                    mt: 1,
                                    bgcolor: '#333',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#555' },
                                    textTransform: 'none'
                                }}
                            >
                                Select
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleAvatarSelect}
                                />
                            </Button>
                        </Box>

                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit}
                            sx={{ flexGrow: 1 }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="User Name"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ bgcolor: '#E8E8E8' }}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                disabled
                                sx={{ bgcolor: '#E8E8E8' }}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ bgcolor: '#E8E8E8' }}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                name="passwordVerify"
                                label="Password Confirm"
                                type="password"
                                id="passwordVerify"
                                value={passwordVerify}
                                onChange={(e) => setPasswordVerify(e.target.value)}
                                sx={{ bgcolor: '#E8E8E8' }}
                            />

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 4,
                                    mt: 3
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#333',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#555' },
                                        textTransform: 'none',
                                        px: 4
                                    }}
                                >
                                    Complete
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleCancel}
                                    sx={{
                                        bgcolor: '#333',
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#555' },
                                        textTransform: 'none',
                                        px: 4
                                    }}
                                >
                                    Cancel
                                </Button>
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ mt: 3 }}
                            >
                                Copyright © Playlister 2025
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
            {modalJSX}
        </Box>
    );
}
