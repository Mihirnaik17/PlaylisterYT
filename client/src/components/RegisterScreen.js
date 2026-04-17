import { useContext, useState } from 'react';
import AuthContext from '../auth'
import MUIErrorModal from './MUIErrorModal'

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const [avatarImage, setAvatarImage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username');
        auth.registerUser(
            username,
            username,
            username,
            formData.get('email'),
            formData.get('password'),
            formData.get('passwordVerify'),
            avatarImage
        );
    };

    const handleAvatarSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setAvatarImage(base64String);
                setAvatarPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    let modalJSX = ""
    console.log(auth);
    if (auth.errorMessage !== null){
        modalJSX = <MUIErrorModal />;
    }
    console.log(modalJSX);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6, px: 2 }}>
            <Container component="main" maxWidth="xs">
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
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                        Create account
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                        Choose a username, secure password, and optional avatar.
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                                src={avatarPreview || undefined}
                                sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}
                            >
                                {!avatarPreview && '👤'}
                            </Avatar>
                            <Button
                                variant="outlined"
                                color="inherit"
                                component="label"
                            >
                                Select
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarSelect}
                                />
                            </Button>
                        </Box>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="User Name"
                            name="username"
                            autoComplete="username"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="passwordVerify"
                            label="Password Confirm"
                            type="password"
                            id="passwordVerify"
                            autoComplete="new-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Create account
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/login/" variant="body2" color="secondary">
                                Already registered? Sign in
                            </Link>
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                            Copyright © Playlister 2026
                        </Typography>
                    </Box>
                </Box>
                { modalJSX }
            </Container>
        </Box>
    );
}