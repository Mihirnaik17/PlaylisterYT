import { useContext, useState, useEffect } from 'react';
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EditIcon from '@mui/icons-material/Edit';

import { getApiBaseUrl } from '../config/apiBase';

const baseURL = getApiBaseUrl();

async function fetchYoutubeMeta(url) {
    const res = await fetch(`${baseURL}/youtube/meta?url=${encodeURIComponent(url)}`, {
        credentials: 'include',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.errorMessage || 'Failed to fetch');
    return data;
}

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [thumbnail, setThumbnail] = useState('');

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youTubeId, setYouTubeId] = useState('');

    useEffect(() => {
        if (store.currentSong) {
            setTitle(store.currentSong.title || '');
            setArtist(store.currentSong.artist || '');
            setYear(String(store.currentSong.year || ''));
            setYouTubeId(store.currentSong.youTubeId || '');
            setThumbnail(
                store.currentSong.youTubeId
                    ? `https://img.youtube.com/vi/${store.currentSong.youTubeId}/default.jpg`
                    : ''
            );
        }
        setYoutubeUrl('');
        setImportError('');
    }, [store.currentSong, store.currentModal]);

    async function handleImport() {
        if (!youtubeUrl.trim()) return;
        setImporting(true);
        setImportError('');
        try {
            const meta = await fetchYoutubeMeta(youtubeUrl.trim());
            setTitle(meta.title || '');
            setArtist(meta.artist || '');
            setYear(String(meta.year || ''));
            setYouTubeId(meta.videoId || '');
            setThumbnail(meta.thumbnailUrl || '');
            setYoutubeUrl('');
        } catch (err) {
            setImportError(err.message || 'Could not import metadata.');
        } finally {
            setImporting(false);
        }
    }

    async function handleConfirm() {
        const isCatalogSong = store.currentSong && store.currentSong._id && store.currentSongIndex === -1;

        const newSongData = {
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            youTubeId: youTubeId.trim(),
        };

        if (isCatalogSong) {
            await store.updateCatalogSong(store.currentSong._id, newSongData);
            store.hideModals();
        } else {
            store.addUpdateSongTransaction(store.currentSongIndex, newSongData);
        }
    }

    function handleClose() {
        store.hideModals();
    }

    return (
        <Modal open={store.isEditSongModalOpen()} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '92vw', sm: 480 },
                    bgcolor: '#181818',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
                    outline: 'none',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        bgcolor: '#121212',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon sx={{ color: '#1DB954', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                            Edit Song
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleClose} sx={{ color: '#B3B3B3', '&:hover': { color: '#fff' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* YouTube URL Import */}
                    <Box>
                        <Typography sx={{ color: '#B3B3B3', fontSize: '0.75rem', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Re-import from YouTube
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Paste a YouTube URL to update metadata…"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
                                InputProps={{
                                    startAdornment: <YouTubeIcon sx={{ color: '#FF0000', mr: 1, fontSize: 20 }} />,
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a2a2a' } }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleImport}
                                disabled={importing || !youtubeUrl.trim()}
                                sx={{ flexShrink: 0, bgcolor: '#1DB954', '&:hover': { bgcolor: '#1aa34a' }, color: '#000', fontWeight: 700, whiteSpace: 'nowrap' }}
                            >
                                {importing ? <CircularProgress size={18} sx={{ color: '#000' }} /> : 'Import'}
                            </Button>
                        </Box>
                        {importError && (
                            <Alert severity="error" sx={{ mt: 1, bgcolor: 'rgba(211,47,47,0.15)', color: '#ff6b6b', fontSize: '0.8rem' }}>
                                {importError}
                            </Alert>
                        )}
                    </Box>

                    {thumbnail && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <img
                                src={thumbnail}
                                alt="thumbnail"
                                style={{ height: 90, borderRadius: 6, objectFit: 'cover' }}
                            />
                        </Box>
                    )}

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <Typography sx={{ color: '#535353', fontSize: '0.75rem' }}>or edit manually</Typography>
                    </Divider>

                    {/* Fields */}
                    <TextField
                        label="Title"
                        fullWidth
                        size="small"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        inputProps={{ id: 'edit-song-modal-title-textfield' }}
                    />
                    <TextField
                        label="Artist"
                        fullWidth
                        size="small"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        inputProps={{ id: 'edit-song-modal-artist-textfield' }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Year"
                            size="small"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            inputProps={{ id: 'edit-song-modal-year-textfield' }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="YouTube ID"
                            size="small"
                            value={youTubeId}
                            onChange={(e) => setYouTubeId(e.target.value)}
                            inputProps={{ id: 'edit-song-modal-youTubeId-textfield' }}
                            sx={{ flex: 2 }}
                        />
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleConfirm}
                            id="edit-song-confirm-button"
                            sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1aa34a' }, color: '#000', fontWeight: 700 }}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleClose}
                            id="edit-song-cancel-button"
                            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#B3B3B3', '&:hover': { borderColor: '#fff', color: '#fff' } }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
