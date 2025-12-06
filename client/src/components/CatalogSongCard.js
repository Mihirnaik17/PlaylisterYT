import { useContext, useState } from 'react'
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
    const [playlistAnchor, setPlaylistAnchor] = useState(null);
    const open = Boolean(anchorEl);
    const playlistOpen = Boolean(playlistAnchor);

    const isOwner = auth.user && auth.user.email === song.ownerEmail;
    
    const handleMenuOpen = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleAddToPlaylist = (event) => {
        setPlaylistAnchor(event.currentTarget);
    };
    
    const handlePlaylistClose = () => {
        setPlaylistAnchor(null);
        setAnchorEl(null);
    };
    
    const handleEditSong = () => {
        store.setCurrentSong(song);
        store.showEditSongModal();
        handleMenuClose();
    };
    
    const handleRemoveSongFromCatalog = () => {
        store.markSongForDeletion(song._id);
        handleMenuClose();
    };
    
    const handleAddToSpecificPlaylist = async (playlistId) => {
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
        handlePlaylistClose();
    };

    const cardBgColor = isOwner ? '#FFE082' : '#FFD180';
    
    // build menu items arry to avoid fragments
    const menuItems = [
        <MenuItem 
            key="add-to-playlist"
            onMouseEnter={handleAddToPlaylist}
            sx={{ bgcolor: '#FFF9C4' }}
        >
            Add to Playlist
        </MenuItem>
    ];
    
    if (isOwner) {
        menuItems.push(
            <MenuItem 
                key="edit-song"
                onClick={handleEditSong}
                sx={{ bgcolor: '#E1BEE7' }}
            >
                Edit Song
            </MenuItem>
        );
        
        menuItems.push(
            <MenuItem 
                key="remove-song"
                onClick={handleRemoveSongFromCatalog}
            >
                Remove from Catalog
            </MenuItem>
        );
    }
    
    // sort playlists by most recently accessed
    const sortedPlaylists = store.idNamePairs && store.idNamePairs.length > 0
        ? [...store.idNamePairs].sort((a, b) => {
            const dateA = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
            const dateB = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
            return dateB - dateA;
          })
        : [];
    
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
                    
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                    >
                        {menuItems}
                    </Menu>
                    
                    <Menu
                        anchorEl={playlistAnchor}
                        open={playlistOpen}
                        onClose={handlePlaylistClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        {sortedPlaylists.length > 0 ? (
                            sortedPlaylists.map((pair) => (
                                <MenuItem 
                                    key={pair._id}
                                    onClick={() => handleAddToSpecificPlaylist(pair._id)}
                                    sx={{ 
                                        bgcolor: '#FFCDD2',
                                        minWidth: '200px'
                                    }}
                                >
                                    {pair.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No playlists available</MenuItem>
                        )}
                    </Menu>
                </Box>
            )}
        </Box>
    );
}

export default CatalogSongCard;