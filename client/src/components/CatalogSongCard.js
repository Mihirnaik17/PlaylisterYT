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
    const { song, onSelect } = props;
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const open = Boolean(anchorEl);
    const playlistMenuOpen = Boolean(playlistMenuAnchor);

    const isOwner = auth.user && auth.user.email === song.ownerEmail;
    
    // Load user playlists when menu opens
    useEffect(() => {
        if (open && !auth.isGuest) {
            loadUserPlaylists();
        }
    }, [open]);
    
    const loadUserPlaylists = async () => {
        setLoadingPlaylists(true);
        try {
            // Call the store function to load user's playlists
            await new Promise((resolve) => {
                store.loadIdNamePairs();
                // Wait a bit for the store to update
                setTimeout(resolve, 100);
            });
            
            // Filter to only user's playlists
            const myPlaylists = store.idNamePairs
                ? store.idNamePairs.filter(p => p.ownerEmail === auth.user.email)
                : [];
            
            console.log('User playlists loaded:', myPlaylists);
            
            // Sort by most recently accessed
            const sorted = [...myPlaylists].sort((a, b) => {
                const dateA = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
                const dateB = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
                return dateB - dateA;
            });
            
            setUserPlaylists(sorted);
        } catch (error) {
            console.error('Error loading playlists:', error);
            setUserPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
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
        if (anchorEl) {
            setPlaylistMenuAnchor(anchorEl);
        }
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
        
        handleMenuClose();
        
        try {
            const result = await store.addSongToPlaylist(playlistId, song._id);
            if (result.success) {
                console.log('✅ Song added to playlist successfully');
            } else {
                console.log('❌ Failed to add song:', result.error);
            }
        } catch (error) {
            console.error('Error adding song:', error);
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
                border: isOwner ? '2px solid #FF6F00' : 'none',
                cursor: 'pointer'
            }}
            onClick={() => { if (onSelect) onSelect(); }}
        >
            <Box sx={{ flex: 1 }}>
                <Box sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {song.title} by {song.artist} ({song.year})
                </Box>
                <Box sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
                    <span style={{ marginRight: '20px' }}>Listens: {song.listens || 0}</span>
                    <span>Playlists: {song.playlists ? song.playlists.length : 0}</span>
                    {isOwner && <span style={{ marginLeft: '20px', color: '#FF6F00', fontWeight: 'bold' }}>★ YOUR SONG</span>}
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
                    
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
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
                            'aria-labelledby': 'playlist-button',
                            onMouseLeave: handleHidePlaylistMenu
                        }}
                        sx={{
                            pointerEvents: 'none',
                            '& .MuiPaper-root': {
                                pointerEvents: 'auto',
                            }
                        }}
                    >
                        {loadingPlaylists ? (
                            <MenuItem disabled>
                                Loading playlists...
                            </MenuItem>
                        ) : userPlaylists.length > 0 ? (
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
                                No playlists found - create one first!
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            )}
        </Box>
    );
}

export default CatalogSongCard;