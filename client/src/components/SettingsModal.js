import { useContext, useState } from 'react';
import AuthContext from '../auth';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';

export default function SettingsModal({ open, onClose }) {
    const { auth } = useContext(AuthContext);

    const [username, setUsername] = useState(auth.user?.username || '');
    const [email, setEmail] = useState(auth.user?.email || '');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [avatarImage, setAvatarImage] = useState(undefined);
    const [localError, setLocalError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAvatarSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setAvatarImage(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setLocalError('');
        setSaving(true);
        await auth.editUser(username, email, password, passwordVerify, avatarImage);
        setSaving(false);
        if (!auth.errorMessage) {
            onClose();
        }
    };

    const handleClose = () => {
        setPassword('');
        setPasswordVerify('');
        setLocalError('');
        auth.clearError && auth.clearError();
        onClose();
    };

    const errorMsg = localError || auth.errorMessage;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: '#1e1e1e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Account Settings</Typography>
                <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.12)', color: '#f44336' }}>
                        {errorMsg}
                    </Alert>
                )}

                {/* Avatar */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <Avatar
                        sx={{ bgcolor: 'secondary.main', width: 72, height: 72, fontSize: 28 }}
                        src={avatarImage || auth.user?.avatar}
                    >
                        {auth.getUserInitials()}
                    </Avatar>
                    <Button variant="outlined" color="inherit" component="label" size="small">
                        Change photo
                        <input type="file" accept="image/*" hidden onChange={handleAvatarSelect} />
                    </Button>
                </Box>

                <Box component="form" noValidate onSubmit={handleSave}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        required
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        size="small"
                        helperText="Leave blank to keep current password"
                        FormHelperTextProps={{ sx: { color: 'text.disabled' } }}
                    />
                    <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordVerify}
                        onChange={(e) => setPasswordVerify(e.target.value)}
                        margin="normal"
                        size="small"
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button variant="outlined" color="inherit" onClick={handleClose} sx={{ flex: 1 }}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ flex: 1 }}
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
