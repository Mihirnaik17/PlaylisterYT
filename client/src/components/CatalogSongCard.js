import { useContext, useState, useEffect } from 'react'
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

function CatalogSongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const { song } = props;
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
    const [duplicateDialogMessage, setDuplicateDialogMessage] = useState('');
    const open = Boolean(anchorEl);
    const playlistMenuOpen = Boolean(playlistMenuAnchor);

    const isOwner = auth.user && auth.user.email === song.ownerEmail;
    
    useEffect(() => {
        if (!auth.isGuest && open) {
            loadUserPlaylists();
        }
    }, [open]);
    
    const loadUserPlaylists = () => {
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
    };
    
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
                    setDuplicateDialogMessage('This song is already in that playlist.');
                    setDuplicateDialogOpen(true);
                } else {
                    console.error('Failed to add song:', result.error);
                }
            }
        } catch (error) {
            console.error('Error adding song:', error);
        }
    };

    const handleCardClick = () => {
        store.setCurrentSong(song);
    };

    const cardBgColor = isOwner ? '#FFE082' : '#FFD180';
    
    return (
        <>
            <Box
                onClick={handleCardClick}
                sx={{
                    bgcolor: cardBgColor,
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: isOwner ? '2px solid #FF6F00' : 'none',
                    cursor: 'pointer'
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {song.title} by {song.artist} ({song.year})
                    </Box>
                    <Box sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
                        <span style={{ marginRight: '20px' }}>Listens: {song.listens || 0}</span>
                        <span>Playlists: {song.playlists ? song.playlists.length : 0}</span>
                    </Box>
                </Box>

                {!auth.isGuest && (
                    <Box>
                        <IconButton
                            onClick={handleMenuOpen}
                            sx={{ ml: 2 }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        
                        {/* Main menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                        >
                            <MenuItem 
                                onClick={handleShowPlaylistMenu}
                                sx={{ 
                                    bgcolor: '#FFF9C4',
                                    '&:hover': {
                                        bgcolor: '#FFF59D'
                                    }
                                }}
                            >
                                Add to Playlist →
                            </MenuItem>
                            
                            {isOwner && (
                                <MenuItem 
                                    onClick={handleEditSong}
                                    sx={{ 
                                        bgcolor: '#E1BEE7',
                                        '&:hover': {
                                            bgcolor: '#CE93D8'
                                        }
                                    }}
                                >
                                    Edit Song
                                </MenuItem>
                            )}
                            
                            {isOwner && (
                                <MenuItem 
                                    onClick={handleRemoveSongFromCatalog}
                                    sx={{ 
                                        bgcolor: '#FFCDD2',
                                        '&:hover': {
                                            bgcolor: '#EF9A9A'
                                        }
                                    }}
                                >
                                    Remove from Catalog
                                </MenuItem>
                            )}
                        </Menu>
                        
                        {/* Playlist submenu */}
                        <Menu
                            anchorEl={playlistMenuAnchor}
                            open={playlistMenuOpen}
                            onClose={handleHidePlaylistMenu}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            {userPlaylists.length > 0 ? (
                                userPlaylists.map((pair) => (
                                    <MenuItem 
                                        key={pair._id}
                                        onClick={(e) => handleAddToSpecificPlaylist(e, pair._id)}
                                        sx={{ 
                                            bgcolor: '#FFCDD2',
                                            minWidth: '200px',
                                            '&:hover': {
                                                bgcolor: '#EF9A9A'
                                            }
                                        }}
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
                )}
            </Box>

            <Dialog
                open={duplicateDialogOpen}
                onClose={() => setDuplicateDialogOpen(false)}
            >
                <DialogTitle>Cannot Add Song</DialogTitle>
                <DialogContent>
                    {duplicateDialogMessage}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDuplicateDialogOpen(false)}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default CatalogSongCard;
