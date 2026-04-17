import { useContext } from 'react';
import GlobalStoreContext from '../store';
import AuthContext from '../auth';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export default function MUIErrorModal() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const handleClose = () => {
        auth.clearError();
        store.hideModals();
    };

    const open = auth.errorMessage !== null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth aria-labelledby="error-dialog-title">
            <DialogTitle
                id="error-dialog-title"
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
            >
                <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                    Notice
                </Typography>
                <IconButton aria-label="Close" onClick={handleClose} edge="end" size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 0 }}>
                <Alert severity="warning" sx={{ alignItems: 'flex-start' }}>
                    {auth.errorMessage}
                </Alert>
            </DialogContent>
        </Dialog>
    );
}
