import { useContext, useState, useEffect } from 'react'
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AddIcon from '@mui/icons-material/Add';

export default function MUIEditPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);
    const [playlistName, setPlaylistName] = useState('');

    useEffect(() => {
        if (store.currentList) {
            setPlaylistName(store.currentList.name);
        }
    }, [store.currentList]);

    function handleClose(event) {
        if (event) event.stopPropagation();
        store.closeCurrentList();
        store.loadIdNamePairs();
    }

    function handleClearName(event) {
        if (event) event.stopPropagation();
        setPlaylistName('');
    }

    function handleNameChange(event) {
        setPlaylistName(event.target.value);
    }

    function handleNameKeyPress(event) {
        if (event.code === "Enter" && playlistName.trim() !== '') {
            event.stopPropagation();
            store.currentList.name = playlistName;
            store.updateCurrentList();
        }
    }

    function handleAddSong(event) {
        if (event) event.stopPropagation();
        store.addNewSong();
    }

    function handleDuplicateSong(index, event) {
        event.stopPropagation();
        event.preventDefault();
        let song = store.currentList.songs[index];
        store.addCreateSongTransaction(
            index + 1,
            song.title,
            song.artist,
            song.year,
            song.youTubeId
        );
    }

    function handleRemoveSong(index, event) {
        event.stopPropagation();
        event.preventDefault();
        let song = store.currentList.songs[index];
        store.addRemoveSongTransaction(song, index);
    }

    function handleUndo(event) {
        if (event) event.stopPropagation();
        store.undo();
    }

    function handleRedo(event) {
        if (event) event.stopPropagation();
        store.redo();
    }

    let songs = [];
    if (store.currentList) {
        songs = store.currentList.songs;
    }

    return (
        <Modal
            open={store.isEditPlaylistModalOpen()}
            onClose={(e) => e.stopPropagation()}
        >
            <Box 
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    bgcolor: '#90EE90',
                    boxShadow: 24,
                    borderRadius: 2,
                    outline: 'none'
                }}
            >
                <Box sx={{
                    bgcolor: '#228B22',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Edit Playlist
                    </Typography>
                </Box>

                <Box sx={{ p: 2 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        mb: 2
                    }}>
                        <TextField
                            value={playlistName}
                            onChange={handleNameChange}
                            onKeyPress={handleNameKeyPress}
                            variant="standard"
                            sx={{
                                flexGrow: 1,
                                '& .MuiInput-root': {
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }
                            }}
                            InputProps={{
                                disableUnderline: true
                            }}
                        />
                        <IconButton 
                            onClick={handleClearName}
                            size="small"
                            sx={{ color: '#666' }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                        <Button
                            variant="contained"
                            onClick={handleAddSong}
                            sx={{
                                bgcolor: '#6B238E',
                                color: 'white',
                                minWidth: '50px',
                                '&:hover': { bgcolor: '#5B1E7E' }
                            }}
                        >
                            <AddIcon fontSize="small" />
                            <MusicNoteIcon fontSize="small" />
                        </Button>
                    </Box>

                    <Box sx={{
                        bgcolor: '#FFF8DC',
                        borderRadius: 1,
                        minHeight: '300px',
                        maxHeight: '400px',
                        overflow: 'auto',
                        p: 1
                    }}>
                        <List sx={{ p: 0 }}>
                            {songs.map((song, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        bgcolor: 'white',
                                        border: '2px solid #333',
                                        borderRadius: 1,
                                        mb: 1,
                                        py: 1.5,
                                        px: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 500 }}>
                                        {index + 1}. {song.title} by {song.artist} ({song.year})
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton 
                                            onClick={(e) => handleDuplicateSong(index, e)}
                                            size="small"
                                            sx={{ color: '#333' }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={(e) => handleRemoveSong(index, e)}
                                            size="small"
                                            sx={{ color: '#333' }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2 
                    }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<UndoIcon />}
                                onClick={handleUndo}
                                disabled={!store.canUndo()}
                                sx={{
                                    bgcolor: '#6B238E',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#5B1E7E' },
                                    '&:disabled': { bgcolor: '#9B69B0', color: '#ddd' }
                                }}
                            >
                                Undo
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<RedoIcon />}
                                onClick={handleRedo}
                                disabled={!store.canRedo()}
                                sx={{
                                    bgcolor: '#6B238E',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#5B1E7E' },
                                    '&:disabled': { bgcolor: '#9B69B0', color: '#ddd' }
                                }}
                            >
                                Redo
                            </Button>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{
                                bgcolor: '#6B238E',
                                color: 'white',
                                textTransform: 'none',
                                px: 4,
                                '&:hover': { bgcolor: '#5B1E7E' }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}