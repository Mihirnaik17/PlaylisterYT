import { useContext, useState, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';

function CatalogSongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const { song } = props;
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const open = Boolean(anchorEl);
    const playlistMenuOpen = Boolean(playlistMenuAnchor);

    const isOwner = auth.user && auth.user.email === song.ownerEmail;
    
    // Load user's playlists when main menu opens
    useEffect(() => {
        if (!auth.isGuest && open) {
            loadUserPlaylists();
        }
    }, [open]);
    
    const loadUserPlaylists = () => {
        // Trigger loading if not already loaded
        if (!store.idNamePairs || store.idNamePairs.length === 0) {
            store.loadIdNamePairs();
        }
        
        // Sort by most recently accessed
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
        setPlaylistMenuAnchor(null); // Close playlist menu if open
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
        setPlaylistMenuAnchor(null);
    };
    
    const handleShowPlaylistMenu = (event) => {
        event.stopPropagation();
        // Keep the playlist menu open by setting anchor
        if (anchorEl) {
            setPlaylistMenuAnchor(anchorEl);
        }
    };
    
    const handleHidePlaylistMenu = () => {
        setPlaylistMenuAnchor(null);
    };
    
    const handleEditSong = (event) => {
        event.stopPropagation();
        console.log('Edit Song clicked:', song);
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
        
        // Close menus first
        handleMenuClose();
        
        try {
            const result = await store.addSongToPlaylist(playlistId, song._id);
            if (result.success) {
                alert('Song added to playlist!');
            } else {
                if (result.error && result.error.includes('already in playlist')) {
                    alert('This song is already in that playlist!');
                } else {
                    alert('Failed to add song: ' + (result.error || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error adding song:', error);
            alert('Failed to add song to playlist');
        }
    };

    const cardBgColor = isOwner ? '#FFE082' : '#FFD180';
    
    return (
        <Box
            sx={{
                bgcolor: cardBgColor,
                borderRadius: 1,
                p: 2,
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: isOwner ? '2px solid #FF6F00' : 'none'
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
                    
                    {/* Main Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            onMouseLeave: handleMenuClose
                        }}
                    >
                        <MenuItem 
                            onMouseEnter={handleShowPlaylistMenu}
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
                    
                    {/* Playlist Submenu */}
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
                        MenuListProps={{
                            onMouseLeave: handleHidePlaylistMenu
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
    );
}

export default CatalogSongCard;