import { useContext, useState, useEffect } from 'react'
import { GlobalStoreContext } from '../store';
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

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

    function handleNameKeyDown(event) {
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
        store.addCreateSongTransaction(index + 1, song.title, song.artist, song.year, song.youTubeId);
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

    function handleDragStart(event, index) {
        event.dataTransfer.setData("songIndex", index);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event, targetIndex) {
        event.preventDefault();
        let sourceIndex = Number(event.dataTransfer.getData("songIndex"));
        if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
            store.addMoveSongTransaction(sourceIndex, targetIndex);
        }
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
                    width: { xs: '95vw', sm: 600 },
                    bgcolor: '#181818',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                    borderRadius: 2,
                    outline: 'none',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <Box sx={{
                    bgcolor: '#282828',
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
                        Edit Playlist
                    </Typography>
                    <IconButton size="small" onClick={handleClose} sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ p: 2 }}>
                    {/* Playlist name + add song */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TextField
                            value={playlistName}
                            onChange={handleNameChange}
                            onKeyDown={handleNameKeyDown}
                            variant="standard"
                            placeholder="Playlist name"
                            sx={{
                                flexGrow: 1,
                                '& .MuiInput-root': {
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                },
                                '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.1)' },
                                '& .MuiInput-underline:hover:before': { borderBottomColor: 'primary.main' },
                                '& .MuiInput-underline:after': { borderBottomColor: 'primary.main' },
                                input: { color: '#fff' },
                            }}
                            InputProps={{ disableUnderline: false }}
                        />
                        <IconButton
                            onClick={handleClearName}
                            size="small"
                            sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' } }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                        <Button
                            variant="contained"
                            onClick={handleAddSong}
                            color="primary"
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                        >
                            <MusicNoteIcon fontSize="small" />
                        </Button>
                    </Box>

                    {/* Song list */}
                    <Box sx={{
                        bgcolor: '#121212',
                        borderRadius: 1,
                        minHeight: 200,
                        maxHeight: 360,
                        overflow: 'auto',
                        border: '1px solid rgba(255,255,255,0.06)',
                        p: 0.5,
                    }}>
                        <List sx={{ p: 0 }}>
                            {songs.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <MusicNoteIcon sx={{ fontSize: 40, color: '#535353', mb: 1 }} />
                                    <Typography variant="body2" color="text.disabled">
                                        No songs yet — click the + button to add one
                                    </Typography>
                                </Box>
                            )}
                            {songs.map((song, index) => (
                                <ListItem
                                    key={index}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    sx={{
                                        bgcolor: '#282828',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 1,
                                        mb: 0.5,
                                        py: 1,
                                        px: 1.5,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'grab',
                                        transition: 'background 0.12s',
                                        '&:hover': { bgcolor: '#333' },
                                        '&:active': { cursor: 'grabbing' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                        <DragIndicatorIcon sx={{ fontSize: 18, color: '#535353', flexShrink: 0 }} />
                                        <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff' }} noWrap>
                                            {index + 1}. {song.title} by {song.artist} ({song.year})
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                        <IconButton
                                            onClick={(e) => handleDuplicateSong(index, e)}
                                            size="small"
                                            sx={{ color: '#B3B3B3', '&:hover': { color: '#1DB954' } }}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={(e) => handleRemoveSong(index, e)}
                                            size="small"
                                            sx={{ color: '#B3B3B3', '&:hover': { color: '#f44336' } }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Footer: undo/redo + close */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                    }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<UndoIcon />}
                                onClick={handleUndo}
                                disabled={!store.canUndo()}
                                size="small"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    color: '#B3B3B3',
                                    '&:hover': { borderColor: '#1DB954', color: '#1DB954' },
                                    '&:disabled': { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)' },
                                }}
                            >
                                Undo
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RedoIcon />}
                                onClick={handleRedo}
                                disabled={!store.canRedo()}
                                size="small"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    color: '#B3B3B3',
                                    '&:hover': { borderColor: '#1DB954', color: '#1DB954' },
                                    '&:disabled': { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)' },
                                }}
                            >
                                Redo
                            </Button>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            color="primary"
                            size="small"
                            sx={{ px: 3 }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
