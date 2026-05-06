import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import { GlobalStoreContext } from '../store';
import AuthContext from '../auth';
import NavigationBar from './NavigationBar';
import PlaylistCard from './PlaylistCard';
import MUIPlayPlaylistModal from './MUIPlayPlaylistModal';
import MUIEditPlaylistModal from './MUIEditPlaylistModal';
import MUIDeleteModal from './MUIDeleteModal';

export default function MyMusicScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.isGuest && auth.loggedIn) {
            setLoading(true);
            Promise.resolve(store.loadIdNamePairs()).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [auth.isGuest, auth.loggedIn]);

    const playlists = Array.isArray(store.idNamePairs) ? store.idNamePairs : [];

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

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
                    My Music
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Your playlists, including Liked Songs.
                </Typography>

                {auth.isGuest || !auth.loggedIn ? (
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            Login required
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                            Create an account or login to view your playlists and liked songs.
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => history.push('/login')}>
                            Login
                        </Button>
                    </Box>
                ) : loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                        {[...Array(5)].map((_, idx) => (
                            <Skeleton
                                key={`my-music-skeleton-${idx}`}
                                variant="rounded"
                                height={74}
                                sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                            />
                        ))}
                    </Box>
                ) : playlists.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {playlists.map((pair) => (
                            <PlaylistCard key={pair._id} idNamePair={pair} selected={false} />
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            No playlists yet
                        </Typography>
                        <Typography variant="body2" color="text.disabled">
                            Create your first playlist from the Playlists tab.
                        </Typography>
                        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => history.push('/home')}>
                            Go to Playlists
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Modals must be mounted on this page too */}
            <MUIDeleteModal />
            <MUIEditPlaylistModal />
            <MUIPlayPlaylistModal />
        </Box>
    );
}

