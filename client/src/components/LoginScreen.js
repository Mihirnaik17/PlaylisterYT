import { useContext } from 'react';
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

export default function LoginScreen() {
    const { auth } = useContext(AuthContext);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        auth.loginUser(
            formData.get('email'),
            formData.get('password')
        );

    };

    let modalJSX = "";
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
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
                        Sign in
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                        Welcome back. Your playlists and AI picks sync from this account.
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign in
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link href="/register/" variant="body2" color="secondary">
                                Need an account? Register
                            </Link>
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                            Copyright © Playlister 2026
                        </Typography>
                    </Box>
                </Box>
            </Container>
            { modalJSX }
        </Box>
    );
}