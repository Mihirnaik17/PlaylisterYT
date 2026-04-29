import { useContext, useState, useEffect, useCallback } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const YT_THUMB = (id) => id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;

function CatalogSongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const { song } = props;

    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [duplicateDialogTitle, setDuplicateDialogTitle] = useState('Notice');
    const [duplicateDialogMessage, setDuplicateDialogMessage] = useState('');
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [loginPromptMessage, setLoginPromptMessage] = useState('');
    const [thumbError, setThumbError] = useState(false);
    const open = Boolean(anchorEl);
    const playlistMenuOpen = Boolean(playlistMenuAnchor);

    const isOwner = auth.user && auth.user.email === song.ownerEmail;
    const isActive = store.currentSong && store.currentSong._id === song._id;
    const thumbUrl = YT_THUMB(song.youTubeId);

    const loadUserPlaylists = useCallback(() => {
        if (!store.idNamePairs || store.idNamePairs.length === 0) {
            store.loadIdNamePairs();
        }
        const sorted = store.idNamePairs && store.idNamePairs.length > 0
            ? [...store.idNamePairs].sort((a, b) => {
                const dateA = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
                const dateB = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
                return dateB - dateA;
            })
            : [];
        setUserPlaylists(sorted);
    }, [store]);

    useEffect(() => {
        if (!auth.isGuest && open) {
            loadUserPlaylists();
        }
    }, [open, auth.isGuest, loadUserPlaylists]);

    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setPlaylistMenuAnchor(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setPlaylistMenuAnchor(null);
    };

    const handleShowPlaylistMenu = (event) => {
        event.stopPropagation();
        if (auth.isGuest) {
            setLoginPromptMessage('Login to add songs to your playlists.');
            setLoginPromptOpen(true);
            handleMenuClose();
            return;
        }
        setPlaylistMenuAnchor(event.currentTarget);
    };

    const handleHidePlaylistMenu = () => {
        setPlaylistMenuAnchor(null);
    };

    const handleEditSong = (event) => {
        event.stopPropagation();
        store.showEditSongModal(-1, song);
        handleMenuClose();
    };

    const handleRemoveSongFromCatalog = (event) => {
        event.stopPropagation();
        store.markSongForDeletion(song._id);
        handleMenuClose();
    };

    const handleAddToSpecificPlaylist = async (event, playlistId) => {
        event.stopPropagation();
        handleHidePlaylistMenu();
        handleMenuClose();
        try {
            const result = await store.addSongToPlaylist(playlistId, song._id);
            if (!result.success) {
                if (result.error && result.error.includes('already in playlist')) {
                    setDuplicateDialogTitle('Cannot Add Song');
                    setDuplicateDialogMessage('This song is already in that playlist.');
                    setDuplicateDialogOpen(true);
                } else {
                    setDuplicateDialogTitle('Cannot Add Song');
                    setDuplicateDialogMessage(result.error || 'Failed to add song.');
                    setDuplicateDialogOpen(true);
                }
            }
        } catch (error) {
            console.error('Error adding song:', error);
            setDuplicateDialogTitle('Error');
            setDuplicateDialogMessage('Failed to add song.');
            setDuplicateDialogOpen(true);
        }
    };

    const handleLikeSong = async (event) => {
        event.stopPropagation();
        handleMenuClose();
        if (auth.isGuest) {
            setLoginPromptMessage('Login to like songs and save them to Liked Songs.');
            setLoginPromptOpen(true);
            return;
        }
        try {
            const result = await store.likeCatalogSong(song._id);
            if (!result.success) {
                setDuplicateDialogTitle('Error');
                setDuplicateDialogMessage(result.error || 'Failed to like song.');
                setDuplicateDialogOpen(true);
            } else {
                setDuplicateDialogTitle('Liked');
                setDuplicateDialogMessage('Added to Liked Songs.');
                setDuplicateDialogOpen(true);
            }
        } catch (error) {
            console.error('Error liking song:', error);
            setDuplicateDialogTitle('Error');
            setDuplicateDialogMessage('Failed to like song.');
            setDuplicateDialogOpen(true);
        }
    };

    const handleCardClick = () => {
        store.setCurrentSong(song);
    };

    const menuPaperSx = {
        bgcolor: '#282828',
        border: '1px solid rgba(255,255,255,0.1)',
        '& .MuiMenuItem-root': {
            color: '#FFFFFF',
            fontSize: '0.9rem',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
        },
    };

    return (
        <>
            <Box
                onClick={handleCardClick}
                sx={{
                    bgcolor: isActive ? '#1a2e1a' : '#181818',
                    borderRadius: 1,
                    p: 1.5,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: isActive ? '#1DB954' : 'rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                        bgcolor: isActive ? '#1e3a1e' : '#282828',
                        borderColor: isActive ? '#1DB954' : 'rgba(255,255,255,0.15)',
                    },
                }}
            >
                {/* YouTube thumbnail */}
                <Box
                    sx={{
                        position: 'relative',
                        width: 72,
                        height: 54,
                        flexShrink: 0,
                        borderRadius: 0.5,
                        overflow: 'hidden',
                        mr: 1.5,
                        border: isActive ? '2px solid #1DB954' : '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    {thumbUrl && !thumbError ? (
                        <Box
                            component="img"
                            src={thumbUrl}
                            alt={song.title}
                            onError={() => setThumbError(true)}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                bgcolor: '#282828',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <MusicNoteIcon sx={{ fontSize: 28, color: '#535353' }} />
                        </Box>
                    )}
                    {isActive && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(29,185,84,0.18)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#1DB954',
                                    animation: 'pulse 1.4s ease-in-out infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                                        '50%': { transform: 'scale(1.5)', opacity: 0.6 },
                                    },
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Song info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        noWrap
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: isActive ? '#1DB954' : 'text.primary',
                            lineHeight: 1.2,
                        }}
                    >
                        {song.title}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.2 }}>
                        {song.artist} · {song.year}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <HeadphonesIcon sx={{ fontSize: 13, color: '#535353' }} />
                            <Typography sx={{ fontSize: '0.75rem', color: '#535353' }}>
                                {song.listens || 0}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <QueueMusicIcon sx={{ fontSize: 13, color: '#535353' }} />
                            <Typography sx={{ fontSize: '0.75rem', color: '#535353' }}>
                                {song.playlists ? song.playlists.length : 0}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box onClick={(e) => e.stopPropagation()}>
                    <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                        sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' } }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        PaperProps={{ sx: menuPaperSx }}
                    >
                        <MenuItem onClick={handleShowPlaylistMenu}>Add to Playlist →</MenuItem>
                        <MenuItem onClick={handleLikeSong}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                                Like Song
                            </Box>
                        </MenuItem>
                        {isOwner && <MenuItem onClick={handleEditSong}>Edit Song</MenuItem>}
                        {isOwner && (
                            <MenuItem onClick={handleRemoveSongFromCatalog} sx={{ color: '#f44336 !important' }}>
                                Remove from Catalog
                            </MenuItem>
                        )}
                    </Menu>

                    <Menu
                        anchorEl={playlistMenuAnchor}
                        open={playlistMenuOpen}
                        onClose={handleHidePlaylistMenu}
                        PaperProps={{ sx: menuPaperSx }}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                        {userPlaylists.length > 0 ? (
                            userPlaylists.map((pair) => (
                                <MenuItem
                                    key={pair._id}
                                    onClick={(e) => handleAddToSpecificPlaylist(e, pair._id)}
                                    sx={{ minWidth: 200 }}
                                >
                                    {pair.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>
                                {store.idNamePairs === null ? 'Loading...' : 'No playlists available'}
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </Box>

            <Dialog
                open={duplicateDialogOpen}
                onClose={() => setDuplicateDialogOpen(false)}
                PaperProps={{ sx: { bgcolor: '#282828', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
            >
                <DialogTitle sx={{ color: '#fff' }}>{duplicateDialogTitle}</DialogTitle>
                <DialogContent sx={{ color: '#B3B3B3' }}>{duplicateDialogMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDuplicateDialogOpen(false)} sx={{ color: '#1DB954' }}>OK</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={loginPromptOpen}
                onClose={() => setLoginPromptOpen(false)}
                PaperProps={{ sx: { bgcolor: '#282828', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
            >
                <DialogTitle sx={{ color: '#fff' }}>Login required</DialogTitle>
                <DialogContent sx={{ color: '#B3B3B3' }}>{loginPromptMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoginPromptOpen(false)} sx={{ color: '#1DB954' }}>OK</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default CatalogSongCard;
