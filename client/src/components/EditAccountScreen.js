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
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4, px: 2 }}>
            <Box
                sx={{
                    maxWidth: 960,
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
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
                <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }} src={avatarImage || auth.user?.avatar}>
                    {auth.getUserInitials()}
                </Avatar>
            </Box>

            <Container component="main" maxWidth="md">
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        padding: 4,
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                        Edit account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Update your profile, password, or avatar.
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
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 72, height: 72 }} src={avatarImage || auth.user?.avatar}>
                                {auth.getUserInitials()}
                            </Avatar>
                            <Button variant="outlined" color="inherit" component="label" sx={{ mt: 1 }}>
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
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                value={email}
                                disabled
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
                            />

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 4,
                                    mt: 3
                                }}
                            >
                                <Button type="submit" variant="contained" color="primary" sx={{ px: 4 }}>
                                    Save changes
                                </Button>
                                <Button variant="outlined" color="inherit" onClick={handleCancel} sx={{ px: 4 }}>
                                    Cancel
                                </Button>
                            </Box>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ mt: 3 }}
                            >
                                Copyright © Playlister 2026
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
            {modalJSX}
        </Box>
    );
}
