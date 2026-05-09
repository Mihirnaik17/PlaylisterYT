import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
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
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'info' });
    const { idNamePair } = props;

    const notify = (msg, severity = 'info') => setSnack({ open: true, msg, severity });
    const closeSnack = () => setSnack(s => ({ ...s, open: false }));

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
            notify('Login to copy playlists.', 'warning');
            return;
        }
        const result = await store.copyPlaylist(idNamePair._id);
        if (result && result.success) {
            notify('Playlist copied!', 'success');
        } else {
            notify('Failed to copy playlist.', 'error');
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

    async function handleLike(event) {
        event.stopPropagation();
        if (auth.isGuest) {
            notify('Login to like playlists.', 'warning');
            return;
        }
        await store.likePlaylist(idNamePair._id);
    }

    async function handleDislike(event) {
        event.stopPropagation();
        if (auth.isGuest) {
            notify('Login to dislike playlists.', 'warning');
            return;
        }
        await store.dislikePlaylist(idNamePair._id);
    }

    async function handleAddComment(event) {
        event.stopPropagation();
        if (!commentText.trim()) {
            notify('Comment cannot be empty.', 'warning');
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
                                color="error"
                                sx={{ minWidth: '70px' }}
                            >
                                DELETE
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleToggleEdit}
                                color="primary"
                                sx={{ minWidth: '60px' }}
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
                            color="secondary"
                            sx={{ minWidth: '60px' }}
                        >
                            COPY
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handlePlayPlaylist}
                        color="primary"
                        sx={{ minWidth: '60px' }}
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
                                color={idNamePair.published ? 'warning' : 'success'}
                                sx={{ minWidth: '100px' }}
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
                            color="primary"
                        >
                            Like ({idNamePair.likes || 0})
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ThumbDownIcon />}
                            onClick={handleDislike}
                            disabled={auth.isGuest}
                            color="error"
                        >
                            Dislike ({idNamePair.dislikes || 0})
                        </Button>
                    </Box>

                    {/* Comments Section */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Comments ({idNamePair.comments ? idNamePair.comments.length : 0})
                        </Typography>

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
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    No comments yet. Be the first to comment!
                                </Typography>
                            )}
                        </Box>

                        {!auth.isGuest && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddComment(e);
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                    color="primary"
                                    sx={{ minWidth: '80px' }}
                                >
                                    Post
                                </Button>
                            </Box>
                        )}
                        {auth.isGuest && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', mt: 2 }}>
                                Log in to add comments
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <MuiAlert onClose={closeSnack} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
                    {snack.msg}
                </MuiAlert>
            </Snackbar>
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
                onKeyDown={handleKeyPress}
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
