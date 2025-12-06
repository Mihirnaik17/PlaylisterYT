import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [editActive, setEditActive] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState("");
    const { idNamePair } = props;

    function handleToggleEdit(event) {
        event.stopPropagation();
        store.openEditPlaylistModal(idNamePair._id);
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsListNameEditActive();
            setText(idNamePair.name);
        }
        setEditActive(newActive);
    }

    async function handleDeleteList(event) {
        event.stopPropagation();
        store.markListForDeletion(idNamePair._id);
    }

    async function handleCopyPlaylist(event) {
        event.stopPropagation();
        if (auth.isGuest) {
            alert('Please log in to copy playlists');
            return;
        }
        const result = await store.copyPlaylist(idNamePair._id);
        if (result && result.success) {
            alert('Playlist copied successfully!');
        } else {
            alert('Failed to copy playlist');
        }
    }

    function handlePlayPlaylist(event) {
        event.stopPropagation();
        store.openPlayPlaylistModal(idNamePair._id);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            store.changeListName(idNamePair._id, text);
            toggleEdit();
        }
    }

    function handleUpdateText(event) {
        setText(event.target.value);
    }

    function handleExpandClick(event) {
        event.stopPropagation();
        setExpanded(!expanded);
    }

    const isOwner = auth.user && auth.user.email === idNamePair.ownerEmail;

    let cardElement =
        <Box
            sx={{
                bgcolor: 'white',
                borderRadius: '8px',
                mb: 2,
                p: 2,
                border: '2px solid #1976d2'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar sx={{ bgcolor: '#FFA500', width: 56, height: 56 }}>
                        👤
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000' }}>
                            {idNamePair.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {idNamePair.ownerUsername || idNamePair.ownerEmail || 'Unknown'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {!auth.isGuest && isOwner && (
                        <>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleDeleteList}
                                sx={{
                                    bgcolor: '#f44336',
                                    color: 'white',
                                    minWidth: '70px',
                                    '&:hover': { bgcolor: '#d32f2f' }
                                }}
                            >
                                DELETE
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleToggleEdit}
                                sx={{
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    minWidth: '60px',
                                    '&:hover': { bgcolor: '#1565c0' }
                                }}
                            >
                                EDIT
                            </Button>
                        </>
                    )}
                    {!auth.isGuest && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleCopyPlaylist}
                            sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                minWidth: '60px',
                                '&:hover': { bgcolor: '#45a049' }
                            }}
                        >
                            COPY
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handlePlayPlaylist}
                        sx={{
                            bgcolor: '#e91e63',
                            color: 'white',
                            minWidth: '60px',
                            '&:hover': { bgcolor: '#c2185b' }
                        }}
                    >
                        PLAY
                    </Button>
                    <IconButton size="small" onClick={handleExpandClick}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            <Typography variant="body2" sx={{ color: '#1976d2', mt: 1 }}>
                {idNamePair.listens || 0} Listens
            </Typography>

            {expanded && (
                <Box sx={{ mt: 2, pl: 8 }}>
                    <Typography variant="body2">
                        Published: {idNamePair.published ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                        Likes: {idNamePair.likes || 0} | Dislikes: {idNamePair.dislikes || 0}
                    </Typography>
                </Box>
            )}
        </Box>

    if (editActive) {
        cardElement =
            <TextField
                margin="normal"
                required
                fullWidth
                id={"list-" + idNamePair._id}
                label="Playlist Name"
                name="name"
                autoComplete="Playlist Name"
                className='list-card'
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={idNamePair.name}
                inputProps={{style: {fontSize: 18}}}
                InputLabelProps={{style: {fontSize: 16}}}
                autoFocus
            />
    }
    return (
        cardElement
    );
}

export default PlaylistCard;