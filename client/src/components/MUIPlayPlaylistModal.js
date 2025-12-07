import { useContext, useState, useRef, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default function MUIPlayPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const playerRef = useRef(null);
    const playerReadyRef = useRef(false);

    const playlist = store.currentList;

    // Load YouTube IFrame API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube IFrame API Ready');
        };

        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Initialize player when song changes
    useEffect(() => {
        if (playlist && playlist.songs && playlist.songs[currentSongIndex] && window.YT) {
            // Destroy previous player if exists
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
            }

            // Create new player
            playerRef.current = new window.YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: playlist.songs[currentSongIndex].youTubeId,
                playerVars: {
                    autoplay: isPlaying ? 1 : 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange
                }
            });
        }
    }, [currentSongIndex, playlist]);

    function onPlayerReady(event) {
        playerReadyRef.current = true;
        if (isPlaying) {
            event.target.playVideo();
        }
    }

    function onPlayerStateChange(event) {
        // YT.PlayerState.ENDED = 0
        if (event.data === 0) {
            handleVideoEnd();
        }
        // YT.PlayerState.PLAYING = 1
        else if (event.data === 1) {
            setIsPlaying(true);
        }
        // YT.PlayerState.PAUSED = 2
        else if (event.data === 2) {
            setIsPlaying(false);
        }
    }

    function handleVideoEnd() {
        console.log('Video ended. Current index:', currentSongIndex, 'Repeat:', repeat);
        
        if (!playlist || !playlist.songs) return;

        if (currentSongIndex === playlist.songs.length - 1) {
            if (repeat) {
                console.log('Looping back to first song');
                setCurrentSongIndex(0);
                setIsPlaying(true);
            } else {
                // Stop playing
                console.log('Playlist finished');
                setIsPlaying(false);
            }
        } else {
            // Go to next song
            console.log('Auto-advancing to next song');
            setCurrentSongIndex(currentSongIndex + 1);
            setIsPlaying(true);
        }
    }

    function handleClose() {
        if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy();
        }
        store.hideModals();
        setCurrentSongIndex(0);
        setIsPlaying(false);
        setRepeat(false);
    }

    function handlePlayPause() {
        if (playerRef.current && playerReadyRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
            setIsPlaying(!isPlaying);
        }
    }

    function handlePrevious() {
        if (playlist && playlist.songs.length > 0) {
            const newIndex = currentSongIndex === 0 
                ? playlist.songs.length - 1 
                : currentSongIndex - 1;
            setCurrentSongIndex(newIndex);
            setIsPlaying(true);
        }
    }

    function handleNext() {
        if (playlist && playlist.songs.length > 0) {
            const newIndex = currentSongIndex === playlist.songs.length - 1 
                ? 0 
                : currentSongIndex + 1;
            setCurrentSongIndex(newIndex);
            setIsPlaying(true);
        }
    }

    function handleSongClick(index) {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    }

    function handleRepeatChange(event) {
        setRepeat(event.target.checked);
        console.log('Repeat toggled:', event.target.checked);
    }

    if (!store.isPlayPlaylistModalOpen() || !playlist) {
        return null;
    }

    const currentSong = playlist.songs && playlist.songs[currentSongIndex];

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        bgcolor: '#90EE90',
        border: '2px solid #000',
        boxShadow: 24,
        display: 'flex',
        flexDirection: 'column'
    };

    return (
        <Modal open={true} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Box
                    sx={{
                        bgcolor: '#006400',
                        color: 'white',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Play Playlist
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            width: '40%',
                            bgcolor: '#E6E6FA',
                            p: 2,
                            overflowY: 'auto',
                            borderRight: '2px solid #000'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Avatar sx={{ bgcolor: '#FFA500', width: 48, height: 48 }}>
                                A
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {playlist.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {playlist.ownerEmail || 'The McKilla Gorilla'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box>
                            {playlist.songs && playlist.songs.map((song, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleSongClick(index)}
                                    sx={{
                                        bgcolor: index === currentSongIndex ? '#FFD700' : '#FFFACD',
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        border: '1px solid #000',
                                        '&:hover': {
                                            bgcolor: index === currentSongIndex ? '#FFD700' : '#FFFFE0'
                                        }
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {index + 1}. {song.title} by {song.artist} ({song.year})
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            width: '60%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            position: 'relative'
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '600px',
                                aspectRatio: '16/9',
                                bgcolor: '#000',
                                mb: 3
                            }}
                        >
                            {currentSong && (
                                <div id="youtube-player"></div>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    bgcolor: '#E6E6FA',
                                    '&:hover': { bgcolor: '#D8BFD8' },
                                    width: 56,
                                    height: 56
                                }}
                            >
                                <SkipPreviousIcon sx={{ fontSize: 32 }} />
                            </IconButton>

                            <IconButton
                                onClick={handlePlayPause}
                                sx={{
                                    bgcolor: '#E6E6FA',
                                    '&:hover': { bgcolor: '#D8BFD8' },
                                    width: 56,
                                    height: 56
                                }}
                            >
                                {isPlaying ? (
                                    <PauseIcon sx={{ fontSize: 32 }} />
                                ) : (
                                    <PlayArrowIcon sx={{ fontSize: 32 }} />
                                )}
                            </IconButton>

                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    bgcolor: '#E6E6FA',
                                    '&:hover': { bgcolor: '#D8BFD8' },
                                    width: 56,
                                    height: 56
                                }}
                            >
                                <SkipNextIcon sx={{ fontSize: 32 }} />
                            </IconButton>
                        </Box>

                        {/* REPEAT CHECKBOX - NEW! */}
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={repeat}
                                    onChange={handleRepeatChange}
                                    sx={{
                                        color: '#006400',
                                        '&.Mui-checked': {
                                            color: '#006400',
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography sx={{ fontWeight: 'bold', color: '#006400' }}>
                                    Repeat
                                </Typography>
                            }
                        />

                        <Button
                            onClick={handleClose}
                            variant="contained"
                            sx={{
                                position: 'absolute',
                                bottom: 20,
                                right: 20,
                                bgcolor: '#006400',
                                color: 'white',
                                px: 4,
                                py: 1,
                                '&:hover': { bgcolor: '#004d00' }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}