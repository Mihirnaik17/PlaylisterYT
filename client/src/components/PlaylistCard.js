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
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DeleteIcon from '@mui/icons-material/Delete';

function PlaylistCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [editActive, setEditActive] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [text, setText] = useState("");
    const [commentText, setCommentText] = useState("");
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
        // #region agent log
        fetch('http://127.0.0.1:7422/ingest/9ace4fda-60c4-46e4-a96b-c3c04a750130',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8f40b7'},body:JSON.stringify({sessionId:'8f40b7',runId:'pre-fix',hypothesisId:'H1',location:'PlaylistCard.js:handlePlayPlaylist',message:'PLAY handler invoked',data:{playlistId:idNamePair?._id,hasStore:!!store,isGuest:!!auth?.isGuest},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log
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

    async function handleLike(event) {
        event.stopPropagation();
        if (auth.isGuest) {
            alert('Please log in to like playlists');
            return;
        }
        await store.likePlaylist(idNamePair._id);
    }

    async function handleDislike(event) {
        event.stopPropagation();
        if (auth.isGuest) {
            alert('Please log in to dislike playlists');
            return;
        }
        await store.dislikePlaylist(idNamePair._id);
    }

    async function handleAddComment(event) {
        event.stopPropagation();
        if (!commentText.trim()) {
            alert('Comment cannot be empty');
            return;
        }
        await store.addComment(idNamePair._id, commentText);
        setCommentText('');
    }

    async function handleDeleteComment(event, commentIndex) {
        event.stopPropagation();
        await store.deleteComment(idNamePair._id, commentIndex);
    }

    const isOwner = auth.user && auth.user.email === idNamePair.ownerEmail;

    let cardElement =
        <Box
            sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                mb: 2,
                p: 2,
                border: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar sx={{ bgcolor: 'secondary.dark', width: 56, height: 56 }}>
                        👤
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap title={idNamePair.name}>
                            {idNamePair.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
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

            <Typography variant="body2" color="primary.main" sx={{ mt: 1, fontWeight: 600 }}>
                {idNamePair.listens || 0} listens
            </Typography>

            {expanded && (
                <Box sx={{ mt: 2, pl: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="body2">
                            Published: {idNamePair.published ? 'Yes' : 'No'}
                        </Typography>
                        {!auth.isGuest && isOwner && (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (idNamePair.published) {
                                        store.unpublishPlaylist(idNamePair._id);
                                    } else {
                                        store.publishPlaylist(idNamePair._id);
                                    }
                                }}
                                sx={{
                                    bgcolor: idNamePair.published ? '#ff9800' : '#4caf50',
                                    color: 'white',
                                    minWidth: '100px',
                                    '&:hover': { 
                                        bgcolor: idNamePair.published ? '#f57c00' : '#45a049' 
                                    }
                                }}
                            >
                                {idNamePair.published ? 'UNPUBLISH' : 'PUBLISH'}
                            </Button>
                        )}
                    </Box>

                    {/* Like/Dislike Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<ThumbUpIcon />}
                            onClick={handleLike}
                            disabled={auth.isGuest}
                            sx={{
                                borderColor: '#4caf50',
                                color: '#4caf50',
                                '&:hover': {
                                    borderColor: '#45a049',
                                    bgcolor: '#f1f8f4'
                                },
                                '&:disabled': {
                                    borderColor: '#ccc',
                                    color: '#999'
                                }
                            }}
                        >
                            Like ({idNamePair.likes || 0})
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ThumbDownIcon />}
                            onClick={handleDislike}
                            disabled={auth.isGuest}
                            sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                '&:hover': {
                                    borderColor: '#d32f2f',
                                    bgcolor: '#fef1f0'
                                },
                                '&:disabled': {
                                    borderColor: '#ccc',
                                    color: '#999'
                                }
                            }}
                        >
                            Dislike ({idNamePair.dislikes || 0})
                        </Button>
                    </Box>

                    {/* Comments Section */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Comments ({idNamePair.comments ? idNamePair.comments.length : 0})
                        </Typography>

                        {/* Display Comments */}
                        <Box sx={{ mb: 2, maxHeight: '200px', overflowY: 'auto' }}>
                            {idNamePair.comments && idNamePair.comments.length > 0 ? (
                                idNamePair.comments.map((comment, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            bgcolor: 'background.default',
                                            p: 1.5,
                                            mb: 1,
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" color="primary.light" sx={{ fontWeight: 700 }}>
                                                    {comment.user || 'Anonymous'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {comment.text}
                                                </Typography>
                                            </Box>
                                            {!auth.isGuest && auth.user && comment.user === auth.user.email && (
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDeleteComment(e, idx)}
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': { bgcolor: '#ffebee' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                                    No comments yet. Be the first to comment!
                                </Typography>
                            )}
                        </Box>

                        {/* Add Comment Input */}
                        {!auth.isGuest && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddComment(e);
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                    sx={{
                                        bgcolor: '#1976d2',
                                        '&:hover': { bgcolor: '#1565c0' },
                                        minWidth: '80px'
                                    }}
                                >
                                    Post
                                </Button>
                            </Box>
                        )}
                        {auth.isGuest && (
                            <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', display: 'block', mt: 2 }}>
                                Log in to add comments
                            </Typography>
                        )}
                    </Box>
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