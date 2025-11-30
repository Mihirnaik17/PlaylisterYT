import { useContext, useState } from 'react';
import AuthContext from '../auth'
import MUIErrorModal from './MUIErrorModal'

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
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
                <Box sx={{ color: 'white', fontSize: '24px' }}>🏠</Box>
                <Box sx={{ color: 'white', fontSize: '24px', cursor: 'pointer' }}>👤</Box>
            </Box>
            <Container component="main" maxWidth="xs">
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
                    <Avatar sx={{ m: 1, bgcolor: '#9C27B0' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Create Account
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                                src={avatarPreview || undefined}
                                sx={{ width: 56, height: 56, bgcolor: '#1976d2' }}
                            >
                                {!avatarPreview && '👤'}
                            </Avatar>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ 
                                    bgcolor: '#333',
                                    color: '#fff',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#555' }
                                }}
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
                            sx={{ bgcolor: '#E8E8E8' }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            sx={{ bgcolor: '#E8E8E8' }}
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
                            sx={{ bgcolor: '#E8E8E8' }}
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
                            sx={{ bgcolor: '#E8E8E8' }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                mt: 3, 
                                mb: 2,
                                bgcolor: '#333',
                                color: '#fff',
                                '&:hover': { bgcolor: '#555' }
                            }}
                        >
                            Create Account
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/login/" variant="body2" sx={{ color: 'red' }}>
                                Already have an account? Sign In
                            </Link>
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                            Copyright © Playlister 2025
                        </Typography>
                    </Box>
                </Box>
                { modalJSX }
            </Container>
        </Box>
    );
}