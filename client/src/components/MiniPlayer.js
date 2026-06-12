import { useContext, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

import { GlobalStoreContext } from '../store';
import { usePlayerContext } from '../store/PlayerContext';
import { usePlaylistPlayer } from '../hooks/usePlaylistPlayer';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';

export default function MiniPlayer() {
    const { store } = useContext(GlobalStoreContext);
    const playerCtx = usePlayerContext();
    const { session, modalOpen, setSession } = playerCtx;

    const playlist = session?.playlist ?? null;

    const {
        currentSongIndex,
        currentSong,
        isPlaying,
        setIsPlaying,
        handleVideoEnd,
        jumpTo,
        previous,
        next,
    } = usePlaylistPlayer(playlist);

    const { play, pause, destroy } = useYouTubePlayer({
        elementId: 'mini-youtube-player',
        videoId: !modalOpen ? currentSong?.youTubeId : undefined,
        onEnded: handleVideoEnd,
        onPlayingChange: setIsPlaying,
        shouldPlay: !modalOpen && isPlaying,
        playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin,
        },
    });

    // When a new session arrives from the modal, jump to the saved position.
    const prevSessionPlaylistIdRef = useRef(null);
    useEffect(() => {
        const id = session?.playlist?._id;
        if (id && id !== prevSessionPlaylistIdRef.current) {
            prevSessionPlaylistIdRef.current = id;
        }
        if (session && !modalOpen) {
            jumpTo(session.currentSongIndex, session.isPlaying);
        }
        // Only fires when a new session is saved (modal just closed with a playlist).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // Pause mini player while the modal is open; resume when it closes.
    useEffect(() => {
        if (modalOpen) {
            pause();
        } else if (isPlaying) {
            play();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalOpen]);

    const handlePlayPause = useCallback(() => {
        setIsPlaying((prev) => {
            if (prev) pause();
            else play();
            return !prev;
        });
    }, [pause, play, setIsPlaying]);

    function handleExpand() {
        // Save the mini player's current position so the modal can restore it.
        setSession({
            playlist,
            currentSongIndex,
            isPlaying,
            repeat: false,
        });
        destroy();
        store.openPlayPlaylistModal(playlist._id);
    }

    // Don't render if there's no session or if modal is already open.
    if (!session || !playlist || modalOpen) return null;

    const songTitle = currentSong?.title || 'Unknown title';
    const songArtist = currentSong?.artist || 'Unknown artist';
    const totalSongs = playlist.songs?.length ?? 0;

    return (
        <>
            {/* Off-screen hidden div for the YouTube player — must be in DOM */}
            <div
                id="mini-youtube-player"
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    width: '1px',
                    height: '1px',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                }}
            />

            {/* Mini player bar — sits above the bottom nav on mobile */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: { xs: '56px', md: 0 },
                    left: 0,
                    right: 0,
                    height: 80,
                    bgcolor: '#181818',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    gap: 2,
                    zIndex: 1300,
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
                }}
            >
                {/* Song info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 1,
                            bgcolor: '#282828',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {currentSong?.youTubeId ? (
                            <img
                                src={`https://img.youtube.com/vi/${currentSong.youTubeId}/default.jpg`}
                                alt={songTitle}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                            />
                        ) : (
                            <MusicNoteIcon sx={{ color: '#B3B3B3', fontSize: 24 }} />
                        )}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            sx={{
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {songTitle}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#B3B3B3',
                                fontSize: '0.75rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {songArtist}
                        </Typography>
                    </Box>
                </Box>

                {/* Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Previous">
                        <span>
                            <IconButton
                                onClick={previous}
                                disabled={totalSongs <= 1}
                                size="small"
                                sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' }, '&:disabled': { color: '#535353' } }}
                            >
                                <SkipPreviousIcon sx={{ fontSize: 28 }} />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <IconButton
                        onClick={handlePlayPause}
                        size="small"
                        sx={{
                            color: '#000',
                            bgcolor: '#fff',
                            '&:hover': { bgcolor: '#e0e0e0', transform: 'scale(1.06)' },
                            width: 36,
                            height: 36,
                        }}
                    >
                        {isPlaying ? <PauseIcon sx={{ fontSize: 20 }} /> : <PlayArrowIcon sx={{ fontSize: 20 }} />}
                    </IconButton>

                    <Tooltip title="Next">
                        <span>
                            <IconButton
                                onClick={next}
                                disabled={totalSongs <= 1}
                                size="small"
                                sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' }, '&:disabled': { color: '#535353' } }}
                            >
                                <SkipNextIcon sx={{ fontSize: 28 }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* Playlist info + expand */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <Typography sx={{ color: '#B3B3B3', fontSize: '0.75rem', display: { xs: 'none', sm: 'block' } }}>
                        {currentSongIndex + 1} / {totalSongs} · {playlist.name}
                    </Typography>
                    <Tooltip title="Open player">
                        <IconButton
                            onClick={handleExpand}
                            size="small"
                            sx={{ color: '#B3B3B3', '&:hover': { color: '#1DB954' } }}
                        >
                            <OpenInFullIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </>
    );
}
