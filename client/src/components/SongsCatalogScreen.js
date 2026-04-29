import { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import CatalogSongCard from './CatalogSongCard'
import NavigationBar from './NavigationBar'
import AIRecommendationsDialog from './AIRecommendationsDialog'
import MUIRemoveSongModal from './MUIRemoveSongModal'
import MUICreateSongModal from './MUICreateSongModal'
import MUIEditSongModal from './MUIEditSongModal'
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function SongsCatalogScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const location = useLocation();
    const [aiOpen, setAiOpen] = useState(false);
    
    
    const [titleSearch, setTitleSearch] = useState('');
    const [artistSearch, setArtistSearch] = useState('');
    const [yearSearch, setYearSearch] = useState('');
    const [currentSort, setCurrentSort] = useState('listens-hi');
    const [loading, setLoading] = useState(true);
    const [resultMeta, setResultMeta] = useState('');

    useEffect(() => {
        setLoading(true);
        store.loadSongs({ sortBy: 'listens', sortOrder: 'desc' }).finally(() => setLoading(false));
    }, [store]);

    useEffect(() => {
        const prefill = location.state && location.state.prefillTitle;
        if (prefill) {
            setTitleSearch(String(prefill));
        }
    }, [location.state]);
    
    const handleSearch = () => {
        const searchParams = {};
        
        if (titleSearch) searchParams.title = titleSearch;
        if (artistSearch) searchParams.artist = artistSearch;
        if (yearSearch) searchParams.year = yearSearch;
        const [field, direction] = currentSort.split('-');
        const order = direction === 'hi' ? 'desc' : 'asc';
        searchParams.sortBy = field;
        searchParams.sortOrder = order;
        
        setLoading(true);
        setResultMeta('Showing filtered catalog results');
        store.loadSongs(searchParams).finally(() => setLoading(false));
    }
    
    const handleClear = () => {
        setTitleSearch('');
        setArtistSearch('');
        setYearSearch('');
        setCurrentSort('listens-hi');
        setLoading(true);
        setResultMeta('');
        store.loadSongs({ sortBy: 'listens', sortOrder: 'desc' }).finally(() => setLoading(false));
    }
    
    const handleSortChange = (event) => {
        const value = event.target.value;
        setCurrentSort(value);
        
        let field, order;
        
        if (value === 'listens-hi') {
            field = 'listens';
            order = 'desc';
        } else if (value === 'listens-lo') {
            field = 'listens';
            order = 'asc';
        } else if (value === 'playlists-hi') {
            field = 'playlists';
            order = 'desc';
        } else if (value === 'playlists-lo') {
            field = 'playlists';
            order = 'asc';
        } else if (value === 'title-az') {
            field = 'title';
            order = 'asc';
        } else if (value === 'title-za') {
            field = 'title';
            order = 'desc';
        } else if (value === 'artist-az') {
            field = 'artist';
            order = 'asc';
        } else if (value === 'artist-za') {
            field = 'artist';
            order = 'desc';
        } else if (value === 'year-hi') {
            field = 'year';
            order = 'desc';
        } else if (value === 'year-lo') {
            field = 'year';
            order = 'asc';
        }
        
        const searchParams = {};
        if (titleSearch) searchParams.title = titleSearch;
        if (artistSearch) searchParams.artist = artistSearch;
        if (yearSearch) searchParams.year = yearSearch;
        searchParams.sortBy = field;
        searchParams.sortOrder = order;
        
        setLoading(true);
        store.loadSongs(searchParams).finally(() => setLoading(false));
    }
    
    const handleNewSong = () => {
        store.showCreateSongModal();
    }
    
    let songCards = "";
    if (store.songs) {
        songCards = store.songs.map((song) => (
            <CatalogSongCard
                key={song._id}
                song={song}
            />
        ));
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
                    flexDirection: { xs: 'column', md: 'row' },
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        width: { xs: '100%', md: '40%' },
                        flexShrink: { md: 0 },
                        minHeight: 0,
                        maxHeight: { xs: '48vh', md: '100%' },
                        overflowY: 'auto',
                        bgcolor: 'background.paper',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: { md: 1 },
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Song catalog
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Search the library, preview on YouTube, add tracks to playlists when signed in.
                    </Typography>
                    
                    <TextField
                        fullWidth
                        placeholder="by Title"
                        value={titleSearch}
                        onChange={(e) => setTitleSearch(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        sx={{ mb: 2 }}
                    />
                    
                    <TextField
                        fullWidth
                        placeholder="by Artist"
                        value={artistSearch}
                        onChange={(e) => setArtistSearch(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        sx={{ mb: 2 }}
                    />
                    
                    <TextField
                        fullWidth
                        placeholder="by Year"
                        value={yearSearch}
                        onChange={(e) => setYearSearch(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button variant="contained" color="primary" onClick={handleSearch} sx={{ flex: 1 }}>
                            Search
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={handleClear} sx={{ flex: 1 }}>
                            Clear
                        </Button>
                    </Box>
                    
                    <Box sx={{ 
                        bgcolor: 'common.black', 
                        height: 250, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: 1,
                        borderColor: 'divider',
                    }}>
                        {store.currentSong && store.currentSong.youTubeId ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${store.currentSong.youTubeId}`}
                                title={store.currentSong.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        ) : (
                            'YouTube Player'
                        )}
                    </Box>
                    
                    {!auth.isGuest && (
                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Button variant="contained" color="secondary" onClick={handleNewSong} fullWidth sx={{ py: 1.5 }}>
                                New song
                            </Button>
                        </Box>
                    )}
                </Box>
                
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        bgcolor: 'background.default',
                        p: 3,
                    }}
                >
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="catalog-sort-label">Sort</InputLabel>
                            <Select
                                labelId="catalog-sort-label"
                                value={currentSort}
                                label="Sort"
                                onChange={handleSortChange}
                            >
                                <MenuItem value="listens-hi">Listens (Hi-Lo)</MenuItem>
                                <MenuItem value="listens-lo">Listens (Lo-Hi)</MenuItem>
                                <MenuItem value="playlists-hi">Playlists (Hi-Lo)</MenuItem>
                                <MenuItem value="playlists-lo">Playlists (Lo-Hi)</MenuItem>
                                <MenuItem value="title-az">Title (A-Z)</MenuItem>
                                <MenuItem value="title-za">Title (Z-A)</MenuItem>
                                <MenuItem value="artist-az">Artist (A-Z)</MenuItem>
                                <MenuItem value="artist-za">Artist (Z-A)</MenuItem>
                                <MenuItem value="year-hi">Year (Hi-Lo)</MenuItem>
                                <MenuItem value="year-lo">Year (Lo-Hi)</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {store.songs ? store.songs.length : 0} songs
                        </Typography>
                    </Box>
                    {resultMeta && (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {resultMeta}
                        </Typography>
                    )}
                    
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
                        {loading ? (
                            <Box sx={{ mt: 1 }}>
                                {[...Array(6)].map((_, idx) => (
                                    <Skeleton
                                        key={`catalog-skeleton-${idx}`}
                                        variant="rounded"
                                        height={78}
                                        sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.08)' }}
                                    />
                                ))}
                            </Box>
                        ) : store.songs && store.songs.length > 0 ? songCards : (
                            <Box sx={{ textAlign: 'center', mt: 6 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No songs found</Typography>
                                <Typography variant="body2" color="text.disabled">
                                    {auth.isGuest ? 'No songs in the catalog yet.' : 'Add the first song from the sidebar.'}
                                </Typography>
                                <Button onClick={handleClear} sx={{ mt: 1.5 }}>
                                    Reset filters
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
            <Tooltip title="AI song recommendations">
                <Fab
                    color="secondary"
                    aria-label="ai recommendations"
                    onClick={() => setAiOpen(true)}
                    sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 2 }}
                >
                    <AutoAwesomeIcon />
                </Fab>
            </Tooltip>
            <AIRecommendationsDialog open={aiOpen} onClose={() => setAiOpen(false)} playlistContext={[]} />
            <MUIRemoveSongModal />
            <MUICreateSongModal />
            <MUIEditSongModal />
        </Box> 
    )
}
