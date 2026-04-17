import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { recommendSongs } from '../store/requests';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const MOOD_PRESETS = ['Chill', 'Focus', 'Party', 'Workout', 'Melancholy', 'Happy'];

export default function AIRecommendationsDialog({ open, onClose, playlistContext }) {
    const history = useHistory();
    const [mood, setMood] = useState('');
    const [genre, setGenre] = useState('');
    const [timeOfDay, setTimeOfDay] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [items, setItems] = useState([]);

    const handleClose = () => {
        if (!loading) {
            setError('');
            onClose();
        }
    };

    const runRecommend = async () => {
        setError('');
        setItems([]);
        if (!mood.trim()) {
            setError('Describe your mood or pick a quick mood below.');
            return;
        }
        setLoading(true);
        try {
            const { data } = await recommendSongs({
                mood: mood.trim(),
                genre: genre.trim() || undefined,
                timeOfDay: timeOfDay || undefined,
                playlistContext: playlistContext || [],
            });
            if (data.success && Array.isArray(data.recommendations)) {
                setItems(data.recommendations);
            } else {
                setError(data.errorMessage || 'Something went wrong.');
            }
        } catch (e) {
            const msg =
                e?.response?.data?.errorMessage ||
                e?.message ||
                'Could not reach the recommendation service.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const goToCatalog = (title) => {
        history.push('/songs', { prefillTitle: title });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon color="primary" />
                AI song picks
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Tell the assistant how you feel (and optionally a genre). You will get six curated ideas you can
                    look up in the Song Catalog.
                </Typography>

                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : null}

                <TextField
                    label="Mood or vibe"
                    placeholder="e.g. rainy Sunday, pre-exam stress, late-night drive"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    fullWidth
                    margin="normal"
                    disabled={loading}
                />

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Quick moods
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                    {MOOD_PRESETS.map((m) => (
                        <Chip
                            key={m}
                            label={m}
                            size="small"
                            onClick={() => setMood(m)}
                            color={mood === m ? 'primary' : 'default'}
                            variant={mood === m ? 'filled' : 'outlined'}
                            disabled={loading}
                        />
                    ))}
                </Stack>

                <TextField
                    label="Genre (optional)"
                    placeholder="e.g. indie rock, K-pop, jazz"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    fullWidth
                    margin="dense"
                    disabled={loading}
                />

                <FormControl fullWidth margin="normal" disabled={loading}>
                    <InputLabel id="ai-time-label">Time of day (optional)</InputLabel>
                    <Select
                        labelId="ai-time-label"
                        label="Time of day (optional)"
                        value={timeOfDay}
                        onChange={(e) => setTimeOfDay(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Auto from clock</em>
                        </MenuItem>
                        <MenuItem value="morning">Morning</MenuItem>
                        <MenuItem value="afternoon">Afternoon</MenuItem>
                        <MenuItem value="evening">Evening</MenuItem>
                        <MenuItem value="night">Night</MenuItem>
                    </Select>
                </FormControl>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : null}

                {items.length > 0 ? (
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                        <Divider />
                        <Typography variant="subtitle2" color="text.secondary">
                            Suggestions
                        </Typography>
                        {items.map((song, idx) => (
                            <Box
                                key={`${song.title}-${song.artist}-${idx}`}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="subtitle1" noWrap title={song.title}>
                                            {song.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap title={song.artist}>
                                            {song.artist}
                                            {song.year ? ` · ${song.year}` : ''}
                                        </Typography>
                                        {song.genre ? (
                                            <Chip label={song.genre} size="small" sx={{ mt: 0.5 }} variant="outlined" />
                                        ) : null}
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {song.reason}
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<MusicNoteIcon />}
                                        onClick={() => goToCatalog(song.title)}
                                    >
                                        Find
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Close
                </Button>
                <Button variant="contained" onClick={runRecommend} disabled={loading} startIcon={<AutoAwesomeIcon />}>
                    Get recommendations
                </Button>
            </DialogActions>
        </Dialog>
    );
}
