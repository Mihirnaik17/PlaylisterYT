import { useContext, useState } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default function MUIPlayPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const playlist = store.currentList;

    function handleClose() {
        store.hideModals();
        setCurrentSongIndex(0);
        setIsPlaying(false);
    }

    function handlePlayPause() {
        setIsPlaying(!isPlaying);
    }

    function handlePrevious() {
        if (playlist && playlist.songs.length > 0) {
            setCurrentSongIndex((prev) => {
                if (prev === 0) return playlist.songs.length - 1;
                return prev - 1;
            });
        }
    }

    function handleNext() {
        if (playlist && playlist.songs.length > 0) {
            setCurrentSongIndex((prev) => {
                if (prev === playlist.songs.length - 1) return 0;
                return prev + 1;
            });
        }
    }

    function handleSongClick(index) {
        setCurrentSongIndex(index);
        setIsPlaying(true);
    }

    if (!store.isPlayPlaylistModalOpen() || !playlist) {
        return null;
    }

    const currentSong = playlist.songs[currentSongIndex];
    const youtubeUrl = currentSong ? `https://www.youtube.com/embed/${currentSong.youTubeId}` : '';

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
                            p: 3
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
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={youtubeUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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