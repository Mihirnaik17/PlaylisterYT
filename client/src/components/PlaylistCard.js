import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const [editActive, setEditActive] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState("");
    const { idNamePair } = props;

    function handleLoadList(event, id) {
        console.log("handleLoadList for " + id);
        if (!event.target.disabled) {
            let _id = event.target.id;
            if (_id.indexOf('list-card-text-') >= 0)
                _id = ("" + _id).substring("list-card-text-".length);

            console.log("load " + event.target.id);

            store.setCurrentList(id);
        }
    }

    function handleToggleEdit(event) {
        event.stopPropagation();
        toggleEdit();
    }

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsListNameEditActive();
        }
        setEditActive(newActive);
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        store.markListForDeletion(id);
    }

    function handleCopyPlaylist(event) {
        event.stopPropagation();
        console.log('Copy playlist');
    }

    function handlePlayPlaylist(event) {
        event.stopPropagation();
        console.log('Play playlist');
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            let id = event.target.id.substring("list-".length);
            store.changeListName(id, text);
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

    let cardElement =
        <Box
            sx={{
                bgcolor: '#d4c5f9',
                borderRadius: '8px',
                mb: 2,
                p: 2,
                border: '1px solid #999'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                        👤
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {idNamePair.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            By: {idNamePair.ownerEmail || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                            137 Listeners
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleToggleEdit}
                        sx={{
                            bgcolor: '#1976d2',
                            minWidth: '60px',
                            '&:hover': { bgcolor: '#1565c0' }
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleCopyPlaylist}
                        sx={{
                            bgcolor: '#4caf50',
                            minWidth: '60px',
                            '&:hover': { bgcolor: '#45a049' }
                        }}
                    >
                        Copy
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handlePlayPlaylist}
                        sx={{
                            bgcolor: '#e91e63',
                            minWidth: '60px',
                            '&:hover': { bgcolor: '#c2185b' }
                        }}
                    >
                        Play
                    </Button>
                    <IconButton size="small" onClick={handleExpandClick}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>
            </Box>

            {expanded && (
                <Box sx={{ mt: 2, pl: 8 }}>
                    <Typography variant="body2">
                        Song list would go here...
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