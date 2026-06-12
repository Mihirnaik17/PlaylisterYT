import { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AuthContext from '../auth';
import { usePlaylistPlayer } from '../hooks/usePlaylistPlayer';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { PlaylistQueue } from './player/PlaylistQueue';
import { PlayerSurface } from './player/PlayerSurface';
import { SongActionsMenu } from './player/SongActionsMenu';
import { usePlayerContext } from '../store/PlayerContext';

export default function MUIPlayPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const playerCtx = usePlayerContext();
    const [songMenuAnchor, setSongMenuAnchor] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState('Info');
    const [infoDialogMessage, setInfoDialogMessage] = useState('');
    const playButtonRef = useRef(null);

    const playlist = store.currentList;
    const isOpen = store.isPlayPlaylistModalOpen() && !!playlist;
    const {
        currentSongIndex,
        currentSong,
        isPlaying,
        setIsPlaying,
        repeat,
        setRepeat,
        handleVideoEnd,
        jumpTo,
        previous,
        next,
        selectSong,
    } = usePlaylistPlayer(playlist);

    const { play, pause, destroy } = useYouTubePlayer({
        elementId: 'youtube-player',
        videoId: currentSong?.youTubeId,
        onEnded: handleVideoEnd,
        onPlayingChange: setIsPlaying,
        shouldPlay: isPlaying,
    });

    // Sync modal open state with PlayerContext so MiniPlayer knows when to defer.
    useEffect(() => {
        playerCtx.setModalOpen(isOpen);
    }, [isOpen, playerCtx]);

    // When modal opens, restore position from PlayerContext if it's the same playlist.
    useEffect(() => {
        if (isOpen && playerCtx.session?.playlist?._id === playlist?._id) {
            jumpTo(playerCtx.session.currentSongIndex, playerCtx.session.isPlaying);
        }
        // Only run when the modal transitions to open state.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Cache playlists early (instead of on every menu-open).
    useEffect(() => {
        if (auth.isGuest) return;
        if (store.idNamePairs === null || (Array.isArray(store.idNamePairs) && store.idNamePairs.length === 0)) {
            store.loadIdNamePairs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth.isGuest, store.idNamePairs]);

    const userPlaylists = useMemo(() => {
        const pairs = store.idNamePairs;
        if (!Array.isArray(pairs) || pairs.length === 0) return [];
        return [...pairs].sort((a, b) => {
            const dateA = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
            const dateB = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
            return dateB - dateA;
        });
    }, [store.idNamePairs]);

    const idNamePairsLoading = store.idNamePairs === null;

    function handleClose() {
        // Save current playback position so MiniPlayer can pick up from here.
        playerCtx.setSession({
            playlist,
            currentSongIndex,
            isPlaying,
            repeat,
        });
        destroy();
        store.hideModals();
        // Do not call reset() — hook state is intentionally preserved for seamless resume.
    }

    const handlePlayPause = useCallback(() => {
        setIsPlaying((prev) => {
            if (prev) pause();
            else play();
            return !prev;
        });
    }, [pause, play, setIsPlaying]);

    const openSongMenu = (event) => {
        event.stopPropagation();
        setSongMenuAnchor(event.currentTarget);
        setPlaylistMenuAnchor(null);
    };

    const closeSongMenu = () => {
        setSongMenuAnchor(null);
        setPlaylistMenuAnchor(null);
    };

    const showPlaylistMenu = (event) => {
        event.stopPropagation();
        if (auth.isGuest) {
            setInfoDialogTitle('Login required');
            setInfoDialogMessage('Login to add songs to your playlists.');
            setInfoDialogOpen(true);
            closeSongMenu();
            return;
        }
        setPlaylistMenuAnchor(event.currentTarget);
    };

    const hidePlaylistMenu = () => setPlaylistMenuAnchor(null);

    const withCatalogSongId = async (embeddedSong) => {
        const lookup = await store.lookupCatalogSongId({
            title: embeddedSong.title,
            artist: embeddedSong.artist,
            year: embeddedSong.year,
        });
        if (!lookup.success) {
            setInfoDialogTitle('Not in catalog');
            setInfoDialogMessage('This song is not in the catalog yet, so it can\'t be liked or added to other playlists.');
            setInfoDialogOpen(true);
            return null;
        }
        return lookup.songId;
    };

    const handleAddToPlaylist = async (event, playlistId) => {
        event.stopPropagation();
        const embeddedSong = playlist?.songs?.[currentSongIndex];
        if (!embeddedSong) return;

        hidePlaylistMenu();
        closeSongMenu();

        const songId = await withCatalogSongId(embeddedSong);
        if (!songId) return;

        const result = await store.addSongToPlaylist(playlistId, songId);
        if (!result.success) {
            setInfoDialogTitle('Cannot add song');
            setInfoDialogMessage(
                result.error && result.error.includes('already in playlist')
                    ? 'This song is already in that playlist.'
                    : (result.error || 'Failed to add song.')
            );
            setInfoDialogOpen(true);
            return;
        }

        setInfoDialogTitle('Added');
        setInfoDialogMessage('Song added to playlist.');
        setInfoDialogOpen(true);
    };

    const handleLikeSong = async (event) => {
        event.stopPropagation();
        const embeddedSong = playlist?.songs?.[currentSongIndex];
        closeSongMenu();

        if (!embeddedSong) return;
        if (auth.isGuest) {
            setInfoDialogTitle('Login required');
            setInfoDialogMessage('Login to like songs and save them to Liked Songs.');
            setInfoDialogOpen(true);
            return;
        }

        const songId = await withCatalogSongId(embeddedSong);
        if (!songId) return;

        const result = await store.likeCatalogSong(songId);
        if (!result.success) {
            setInfoDialogTitle('Failed');
            setInfoDialogMessage(result.error || 'Failed to like song.');
            setInfoDialogOpen(true);
            return;
        }

        setInfoDialogTitle('Liked');
        setInfoDialogMessage('Added to Liked Songs.');
        setInfoDialogOpen(true);
    };

    function handleSongClick(index) {
        selectSong(index);
    }

    // Focus the play button when the modal opens (better keyboard UX).
    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => {
            playButtonRef.current?.focus?.();
        }, 0);
        return () => clearTimeout(t);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <Modal
                open={store.isPlayPlaylistModalOpen()}
                onClose={handleClose}
                aria-labelledby="play-playlist-modal-title"
                onKeyDown={(e) => {
                    if (e.key === ' ') {
                        e.preventDefault();
                        handlePlayPause();
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        previous();
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        next();
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '96vw', md: '82vw' },
                        maxWidth: 1100,
                        height: { xs: '90vh', md: '80vh' },
                        bgcolor: '#121212',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            px: 3,
                            py: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            bgcolor: '#181818',
                            flexShrink: 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LibraryMusicIcon sx={{ color: '#1DB954', fontSize: 22 }} />
                            <Typography id="play-playlist-modal-title" sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                                {playlist.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#B3B3B3', ml: 0.5 }}>
                                · {playlist.songs ? playlist.songs.length : 0} songs
                            </Typography>
                        </Box>
                        <IconButton aria-label="Close player" onClick={handleClose} size="small" sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' } }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Body */}
                    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <PlaylistQueue
                            songs={playlist.songs || []}
                            currentSongIndex={currentSongIndex}
                            isPlaying={isPlaying}
                            onSelectSong={handleSongClick}
                        />

                        <Box sx={{ position: 'relative', flex: 1, display: 'flex' }}>
                            <PlayerSurface
                                currentSong={currentSong}
                                isPlaying={isPlaying}
                                repeat={repeat}
                                onToggleRepeat={() => setRepeat((r) => !r)}
                                onPrevious={previous}
                                onPlayPause={handlePlayPause}
                                onNext={next}
                                onOpenSongMenu={openSongMenu}
                                playButtonRef={playButtonRef}
                            />

                            <SongActionsMenu
                                songMenuAnchor={songMenuAnchor}
                                playlistMenuAnchor={playlistMenuAnchor}
                                onCloseSongMenu={closeSongMenu}
                                onShowPlaylistMenu={showPlaylistMenu}
                                onHidePlaylistMenu={hidePlaylistMenu}
                                onLikeSong={handleLikeSong}
                                userPlaylists={userPlaylists}
                                idNamePairsLoading={idNamePairsLoading}
                                onAddToPlaylist={handleAddToPlaylist}
                            />
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <Dialog
                open={infoDialogOpen}
                onClose={() => setInfoDialogOpen(false)}
                PaperProps={{ sx: { bgcolor: '#282828', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
            >
                <DialogTitle sx={{ color: '#fff' }}>{infoDialogTitle}</DialogTitle>
                <DialogContent sx={{ color: '#B3B3B3' }}>{infoDialogMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setInfoDialogOpen(false)} sx={{ color: '#1DB954' }}>OK</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
