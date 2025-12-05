import { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { GlobalStoreContext } from '../store/index.js'
import NavigationBar from './NavigationBar'
import SongCard from './SongCard.js'
import MUIEditSongModal from './MUIEditSongModal.js'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

/*
    This React component lets us edit a loaded list, which only
    happens when we are on the proper route.
    
    @author McKilla Gorilla
*/
function WorkspaceScreen() {
    const { store } = useContext(GlobalStoreContext);
    store.history = useHistory();
    
    let modalJSX = "";
    if (store.isEditSongModalOpen()) {
        modalJSX = <MUIEditSongModal />;
    }

    if (!store.currentList) {
        return null;
    }

    return (
        <Box sx={{ height: '100vh', bgcolor: '#f0e6f6' }}>
            <NavigationBar />
            <Box sx={{ 
                height: 'calc(100vh - 80px)', 
                bgcolor: '#00ff00',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <Box sx={{ 
                    bgcolor: '#1976d2', 
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Play Playlist
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <Box sx={{ 
                        width: '40%', 
                        bgcolor: '#e8d5f0',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                                👤
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {store.currentList.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {store.currentList.ownerUsername}
                                </Typography>
                            </Box>
                        </Box>

                        <List sx={{ flex: 1, overflow: 'auto', bgcolor: 'transparent' }}>
                            {store.currentList.songs.map((song, index) => (
                                <SongCard
                                    id={'playlist-song-' + (index)}
                                    key={'playlist-song-' + (index)}
                                    index={index}
                                    song={song}
                                />
                            ))}
                        </List>
                    </Box>

                    <Box sx={{ 
                        width: '60%', 
                        bgcolor: '#90ee90',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4
                    }}>
                        <Box sx={{ 
                            width: '100%',
                            maxWidth: '600px',
                            bgcolor: '#000',
                            aspectRatio: '16/9',
                            mb: 4
                        }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${store.currentList.songs[0]?.youTubeId || ''}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                <SkipPreviousIcon />
                            </IconButton>
                            <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                <PlayArrowIcon />
                            </IconButton>
                            <IconButton sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                <SkipNextIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    onClick={() => store.history.push('/')}
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        bgcolor: '#008080',
                        color: 'white',
                        '&:hover': { bgcolor: '#006666' }
                    }}
                >
                    Close
                </Button>
            </Box>
            {modalJSX}
        </Box>
    )
}

export default WorkspaceScreen;