import { useContext, useState } from 'react';
import GlobalStoreContext from '../store';
import AuthContext from '../auth';
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
import MusicNoteIcon from '@mui/icons-material/MusicNote';

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

export default function MUICreateSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [thumbnail, setThumbnail] = useState('');

    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youTubeId, setYouTubeId] = useState('');

    const isComplete =
        title.trim() !== '' &&
        artist.trim() !== '' &&
        year.toString().trim() !== '' &&
        youTubeId.trim() !== '';

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
        } catch (err) {
            setImportError(err.message || 'Could not import metadata. Check the URL and try again.');
        } finally {
            setImporting(false);
        }
    }

    async function handleConfirmCreateSong() {
        const newSongData = {
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            youTubeId: youTubeId.trim(),
            ownerEmail: auth.user.email,
        };
        try {
            await store.createCatalogSong(newSongData);
            handleClose();
        } catch (error) {
            setImportError('Failed to create song. Please try again.');
        }
    }

    function handleClose() {
        setYoutubeUrl('');
        setImporting(false);
        setImportError('');
        setThumbnail('');
        setTitle('');
        setArtist('');
        setYear('');
        setYouTubeId('');
        store.hideModals();
    }

    return (
        <Modal open={store.currentModal === 'CREATE_SONG'} onClose={handleClose}>
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
                        <MusicNoteIcon sx={{ color: '#1DB954', fontSize: 22 }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                            Add Song to Catalog
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
                            Import from YouTube
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Paste a YouTube URL…"
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
                        <Typography sx={{ color: '#535353', fontSize: '0.75rem' }}>or fill in manually</Typography>
                    </Divider>

                    {/* Fields */}
                    <TextField
                        label="Title"
                        fullWidth
                        size="small"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        inputProps={{ id: 'create-song-modal-title-textfield' }}
                    />
                    <TextField
                        label="Artist"
                        fullWidth
                        size="small"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        inputProps={{ id: 'create-song-modal-artist-textfield' }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Year"
                            size="small"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            inputProps={{ id: 'create-song-modal-year-textfield' }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="YouTube ID"
                            size="small"
                            value={youTubeId}
                            onChange={(e) => setYouTubeId(e.target.value)}
                            inputProps={{ id: 'create-song-modal-youTubeId-textfield' }}
                            sx={{ flex: 2 }}
                        />
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={!isComplete}
                            onClick={handleConfirmCreateSong}
                            id="create-song-confirm-button"
                            sx={{ bgcolor: '#1DB954', '&:hover': { bgcolor: '#1aa34a' }, color: '#000', fontWeight: 700 }}
                        >
                            Add to Catalog
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleClose}
                            id="create-song-cancel-button"
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
