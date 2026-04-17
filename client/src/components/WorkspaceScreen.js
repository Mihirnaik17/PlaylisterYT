import { useContext, useState, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { GlobalStoreContext } from '../store/index.js'
import AuthContext from '../auth'
import NavigationBar from './NavigationBar'
import AIRecommendationsDialog from './AIRecommendationsDialog'
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
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/*
    This React component lets us edit a loaded list, which only
    happens when we are on the proper route.
    
    @author McKilla Gorilla
*/
function WorkspaceScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [aiOpen, setAiOpen] = useState(false);
    store.history = useHistory();

    const playlistContext = useMemo(() => {
        const songs = store.currentList && store.currentList.songs;
        if (!songs) {
            return [];
        }
        return songs.map((s) => ({ title: s.title, artist: s.artist }));
    }, [store.currentList]);

    if (!store.currentList) {
        return null;
    }

    const isOwner = auth.user && auth.user.email === store.currentList.ownerEmail;

    let modalJSX = "";
    if (isOwner && store.isEditSongModalOpen()) {
        modalJSX = <MUIEditSongModal />;
    }

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: 'background.default',
            }}
        >
            <NavigationBar />
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Now playing
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                        flexDirection: { xs: 'column', md: 'row' },
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: '100%', md: '40%' },
                            flexShrink: { md: 0 },
                            minHeight: 0,
                            maxHeight: { xs: '42vh', md: '100%' },
                            bgcolor: 'background.paper',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRight: { md: 1 },
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 48, height: 48 }}>
                                👤
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap title={store.currentList.name}>
                                    {store.currentList.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {store.currentList.ownerUsername}
                                </Typography>
                            </Box>
                        </Box>

                        <List sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'transparent' }}>
                            {store.currentList.songs.map((song, index) => (
                                <SongCard
                                    id={'playlist-song-' + (index)}
                                    key={'playlist-song-' + (index)}
                                    index={index}
                                    song={song}
                                    readOnly={!isOwner}
                                />
                            ))}
                        </List>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            bgcolor: 'background.default',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 2, md: 4 },
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 720,
                                bgcolor: 'common.black',
                                borderRadius: 2,
                                overflow: 'hidden',
                                aspectRatio: '16/9',
                                mb: 3,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
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
                            <IconButton sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
                                <SkipPreviousIcon />
                            </IconButton>
                            <IconButton sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}>
                                <PlayArrowIcon />
                            </IconButton>
                            <IconButton sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
                                <SkipNextIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => store.history.push('/home')}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 2,
                    }}
                >
                    Back to lists
                </Button>

                <Tooltip title="AI picks for this playlist vibe">
                    <Fab
                        color="secondary"
                        size="medium"
                        aria-label="ai recommendations"
                        onClick={() => setAiOpen(true)}
                        sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 2 }}
                    >
                        <AutoAwesomeIcon />
                    </Fab>
                </Tooltip>
            </Box>
            <AIRecommendationsDialog open={aiOpen} onClose={() => setAiOpen(false)} playlistContext={playlistContext} />
            {modalJSX}
        </Box>
    )
}

export default WorkspaceScreen;
