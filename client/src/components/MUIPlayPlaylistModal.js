import { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';
import CloseIcon from '@mui/icons-material/Close';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AuthContext from '../auth';

export default function MUIPlayPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const playerRef = useRef(null);
    const playerReadyRef = useRef(false);
    const ytReadyPromiseRef = useRef(null);
    const repeatRef = useRef(repeat);
    const isPlayingRef = useRef(isPlaying);
    const playlistRef = useRef(null);
    const [songMenuAnchor, setSongMenuAnchor] = useState(null);
    const [playlistMenuAnchor, setPlaylistMenuAnchor] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoDialogTitle, setInfoDialogTitle] = useState('Info');
    const [infoDialogMessage, setInfoDialogMessage] = useState('');

    const playlist = store.currentList;

    useEffect(() => {
        repeatRef.current = repeat;
    }, [repeat]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        playlistRef.current = playlist || null;
        const len = playlist?.songs?.length ?? 0;
        setCurrentSongIndex((prev) => (len === 0 ? 0 : Math.min(prev, len - 1)));
        if (len === 0) setIsPlaying(false);
    }, [playlist]);

    const ensureYouTubeApi = useCallback(() => {
        if (window.YT && window.YT.Player) {
            return Promise.resolve(true);
        }
        if (ytReadyPromiseRef.current) return ytReadyPromiseRef.current;

        ytReadyPromiseRef.current = new Promise((resolve) => {
            const prior = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prior === 'function') prior();
                resolve(true);
            };

            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                const firstScriptTag = document.getElementsByTagName('script')[0];
                if (firstScriptTag?.parentNode) firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                else document.head.appendChild(tag);
            }
        });

        return ytReadyPromiseRef.current;
    }, []);

    const handleVideoEnd = useCallback(() => {
        const pl = playlistRef.current;
        const len = pl?.songs?.length ?? 0;
        if (len === 0) return;

        setCurrentSongIndex((prev) => {
            const isLast = prev >= len - 1;
            const nextIndex = isLast ? (repeatRef.current ? 0 : prev) : prev + 1;
            const nextPlaying = !(isLast && !repeatRef.current);
            setIsPlaying(nextPlaying);
            return nextIndex;
        });
    }, []);

    const onPlayerReady = useCallback((event) => {
        playerReadyRef.current = true;
        if (isPlayingRef.current) event.target.playVideo();
    }, []);

    const onPlayerStateChange = useCallback((event) => {
        if (event.data === 0) handleVideoEnd();
        else if (event.data === 1) setIsPlaying(true);
        else if (event.data === 2) setIsPlaying(false);
    }, [handleVideoEnd]);

    useEffect(() => {
        ensureYouTubeApi();
        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
            playerRef.current = null;
            playerReadyRef.current = false;
        };
    }, [ensureYouTubeApi]);

    useEffect(() => {
        const song = playlist?.songs?.[currentSongIndex];
        if (!song) return;

        let cancelled = false;
        ensureYouTubeApi().then(() => {
            if (cancelled) return;
            if (!(window.YT && window.YT.Player)) return;

            playerReadyRef.current = false;
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }

            playerRef.current = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: song.youTubeId,
                playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
                events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
            });
        });

        return () => {
            cancelled = true;
        };
    }, [currentSongIndex, playlist, ensureYouTubeApi, onPlayerReady, onPlayerStateChange]);

    useEffect(() => {
        if (!auth.isGuest && Boolean(songMenuAnchor)) {
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
        }
    }, [songMenuAnchor, auth.isGuest, store]);

    function handleClose() {
        if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
        playerRef.current = null;
        playerReadyRef.current = false;
        store.hideModals();
        setCurrentSongIndex(0);
        setIsPlaying(false);
        setRepeat(false);
    }

    function handlePlayPause() {
        if (playerRef.current && playerReadyRef.current) {
            setIsPlaying((prev) => {
                if (prev) playerRef.current.pauseVideo();
                else playerRef.current.playVideo();
                return !prev;
            });
        }
    }

    function handlePrevious() {
        const len = playlist?.songs?.length ?? 0;
        if (len > 0) {
            setCurrentSongIndex((prev) => (prev === 0 ? len - 1 : prev - 1));
            setIsPlaying(true);
        }
    }

    function handleNext() {
        const len = playlist?.songs?.length ?? 0;
        if (len > 0) {
            setCurrentSongIndex((prev) => (prev >= len - 1 ? 0 : prev + 1));
            setIsPlaying(true);
        }
    }

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
            setInfoDialogMessage('This song is not in the catalog yet, so it can’t be liked or added to other playlists.');
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
        setCurrentSongIndex(index);
        setIsPlaying(true);
    }

    if (!store.isPlayPlaylistModalOpen() || !playlist) return null;

    const currentSong = playlist.songs && playlist.songs[currentSongIndex];

    return (
        <Modal open={store.isPlayPlaylistModalOpen()} onClose={handleClose} aria-labelledby="play-playlist-modal-title">
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
                    {/* Song queue (left panel) */}
                    <Box
                        sx={{
                            width: { xs: '38%', md: '32%' },
                            borderRight: '1px solid rgba(255,255,255,0.06)',
                            overflowY: 'auto',
                            flexShrink: 0,
                            bgcolor: '#181818',
                            py: 1,
                        }}
                    >
                        <Typography sx={{ px: 2, py: 1, fontSize: '0.72rem', fontWeight: 700, color: '#B3B3B3', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Queue
                        </Typography>
                        {playlist.songs && playlist.songs.map((song, index) => (
                            <Box
                                key={index}
                                onClick={() => handleSongClick(index)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1,
                                    cursor: 'pointer',
                                    bgcolor: index === currentSongIndex ? 'rgba(29,185,84,0.1)' : 'transparent',
                                    borderLeft: index === currentSongIndex ? '3px solid #1DB954' : '3px solid transparent',
                                    transition: 'all 0.12s',
                                    '&:hover': {
                                        bgcolor: index === currentSongIndex ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)',
                                    },
                                }}
                            >
                                {index === currentSongIndex && isPlaying ? (
                                    <Box sx={{ width: 18, flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: '2px', height: 18 }}>
                                        {[1, 0.6, 0.85].map((h, i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    width: 3,
                                                    bgcolor: '#1DB954',
                                                    borderRadius: 0.5,
                                                    animation: `eqBar${i} 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                                                    [`@keyframes eqBar${i}`]: {
                                                        from: { height: `${h * 6}px` },
                                                        to: { height: `${h * 18}px` },
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography sx={{ width: 18, textAlign: 'center', fontSize: '0.78rem', color: index === currentSongIndex ? '#1DB954' : '#B3B3B3', flexShrink: 0 }}>
                                        {index + 1}
                                    </Typography>
                                )}
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontSize: '0.85rem',
                                            fontWeight: index === currentSongIndex ? 700 : 400,
                                            color: index === currentSongIndex ? '#1DB954' : '#fff',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {song.title}
                                    </Typography>
                                    <Typography noWrap sx={{ fontSize: '0.76rem', color: '#B3B3B3', lineHeight: 1.3 }}>
                                        {song.artist}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Player (right panel) */}
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 2, md: 4 },
                            bgcolor: '#121212',
                            gap: 3,
                        }}
                    >
                        {/* Now playing label */}
                        {currentSong && (
                            <Box sx={{ textAlign: 'center', width: '100%' }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#1DB954', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>
                                    Now Playing
                                </Typography>
                                <Typography noWrap sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                                    {currentSong.title}
                                </Typography>
                                <Typography noWrap sx={{ fontSize: '0.85rem', color: '#B3B3B3' }}>
                                    {currentSong.artist} · {currentSong.year}
                                </Typography>
                            </Box>
                        )}

                        {/* YouTube embed */}
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 560,
                                aspectRatio: '16/9',
                                bgcolor: '#000',
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.06)',
                                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                            }}
                        >
                            {currentSong ? (
                                <div id="youtube-player" style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MusicNoteIcon sx={{ fontSize: 56, color: '#535353' }} />
                                </Box>
                            )}
                        </Box>

                        {/* Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title={repeat ? 'Repeat: On' : 'Repeat: Off'}>
                                <IconButton
                                    aria-label={repeat ? 'Turn repeat off' : 'Turn repeat on'}
                                    onClick={() => setRepeat(!repeat)}
                                    sx={{
                                        color: repeat ? '#1DB954' : '#B3B3B3',
                                        '&:hover': { color: repeat ? '#1ed760' : '#fff' },
                                    }}
                                >
                                    <RepeatIcon />
                                </IconButton>
                            </Tooltip>

                            <IconButton
                                aria-label="Previous song"
                                onClick={handlePrevious}
                                sx={{
                                    color: '#B3B3B3',
                                    '&:hover': { color: '#fff' },
                                    width: 44,
                                    height: 44,
                                }}
                            >
                                <SkipPreviousIcon sx={{ fontSize: 28 }} />
                            </IconButton>

                            <IconButton
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                onClick={handlePlayPause}
                                sx={{
                                    bgcolor: '#1DB954',
                                    color: '#000',
                                    width: 52,
                                    height: 52,
                                    '&:hover': { bgcolor: '#1ed760', transform: 'scale(1.06)' },
                                    transition: 'all 0.15s',
                                }}
                            >
                                {isPlaying ? <PauseIcon sx={{ fontSize: 28 }} /> : <PlayArrowIcon sx={{ fontSize: 28 }} />}
                            </IconButton>

                            <IconButton
                                aria-label="Next song"
                                onClick={handleNext}
                                sx={{
                                    color: '#B3B3B3',
                                    '&:hover': { color: '#fff' },
                                    width: 44,
                                    height: 44,
                                }}
                            >
                                <SkipNextIcon sx={{ fontSize: 28 }} />
                            </IconButton>

                            <IconButton
                                aria-label="Song actions"
                                onClick={openSongMenu}
                                sx={{
                                    color: '#B3B3B3',
                                    '&:hover': { color: '#fff' },
                                    width: 44,
                                    height: 44,
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>

                            <Menu
                                anchorEl={songMenuAnchor}
                                open={Boolean(songMenuAnchor)}
                                onClose={closeSongMenu}
                                PaperProps={{
                                    sx: {
                                        bgcolor: '#282828',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '& .MuiMenuItem-root': {
                                            color: '#FFFFFF',
                                            fontSize: '0.9rem',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                                        },
                                    },
                                }}
                            >
                                <MenuItem onClick={showPlaylistMenu}>Add to Playlist →</MenuItem>
                                <MenuItem onClick={handleLikeSong}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                                        Like Song
                                    </Box>
                                </MenuItem>
                            </Menu>

                            <Menu
                                anchorEl={playlistMenuAnchor}
                                open={Boolean(playlistMenuAnchor)}
                                onClose={hidePlaylistMenu}
                                PaperProps={{
                                    sx: {
                                        bgcolor: '#282828',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        '& .MuiMenuItem-root': {
                                            color: '#FFFFFF',
                                            fontSize: '0.9rem',
                                            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                                        },
                                    },
                                }}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            >
                                {userPlaylists.length > 0 ? (
                                    userPlaylists.map((pair) => (
                                        <MenuItem
                                            key={pair._id}
                                            onClick={(e) => handleAddToPlaylist(e, pair._id)}
                                            sx={{ minWidth: 220 }}
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
                </Box>
            </Box>

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
        </Modal>
    );
}
