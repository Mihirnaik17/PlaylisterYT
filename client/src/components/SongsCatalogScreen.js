import { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import CatalogSongCard from './CatalogSongCard'
import NavigationBar from './NavigationBar'  
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

export default function SongsCatalogScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    
    
    const [titleSearch, setTitleSearch] = useState('');
    const [artistSearch, setArtistSearch] = useState('');
    const [yearSearch, setYearSearch] = useState('');
    const [currentSort, setCurrentSort] = useState('listens-hi'); 
    
    useEffect(() => {
        store.loadSongs({ sortBy: 'listens', sortOrder: 'desc' });
    }, []);
    
    const handleSearch = () => {
        const searchParams = {};
        
        if (titleSearch) searchParams.title = titleSearch;
        if (artistSearch) searchParams.artist = artistSearch;
        if (yearSearch) searchParams.year = yearSearch;
        const [field, direction] = currentSort.split('-');
        const order = direction === 'hi' ? 'desc' : 'asc';
        searchParams.sortBy = field;
        searchParams.sortOrder = order;
        
        store.loadSongs(searchParams);
    }
    
    const handleClear = () => {
        setTitleSearch('');
        setArtistSearch('');
        setYearSearch('');
        setCurrentSort('listens-hi');
        store.loadSongs({ sortBy: 'listens', sortOrder: 'desc' });
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
        
        store.loadSongs(searchParams);
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
        <>
            <NavigationBar />
            <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
                <Box sx={{ 
                    width: '40%', 
                    bgcolor: '#F5E6D3', 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Box sx={{ mb: 2 }}>
                        <h2 style={{ color: '#9C27B0', margin: '0 0 20px 0' }}>Songs Catalog</h2>
                    </Box>
                    
                    <TextField
                        fullWidth
                        placeholder="by Title"
                        value={titleSearch}
                        onChange={(e) => setTitleSearch(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        sx={{ mb: 2, bgcolor: '#E0D4E8' }}
                    />
                    
                    <TextField
                        fullWidth
                        placeholder="by Artist"
                        value={artistSearch}
                        onChange={(e) => setArtistSearch(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        sx={{ mb: 2, bgcolor: '#E0D4E8' }}
                    />
                    
                    <TextField
                        fullWidth
                        placeholder="by Year"
                        value={yearSearch}
                        onChange={(e) => setYearSearch(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        sx={{ mb: 2, bgcolor: '#E0D4E8' }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleSearch}
                            sx={{ bgcolor: '#5E35B1', '&:hover': { bgcolor: '#4527A0' } }}
                        >
                            Search
                        </Button>
                        <Button 
                            variant="contained"
                            onClick={handleClear}
                            sx={{ bgcolor: '#5E35B1', '&:hover': { bgcolor: '#4527A0' } }}
                        >
                            Clear
                        </Button>
                    </Box>
                    
                    <Box sx={{ 
                        bgcolor: '#424242', 
                        height: '250px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        YouTube Player
                    </Box>
                    
                    {!auth.isGuest && (
                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Button 
                                variant="contained"
                                onClick={handleNewSong}
                                fullWidth
                                sx={{ 
                                    bgcolor: '#5E35B1', 
                                    '&:hover': { bgcolor: '#4527A0' },
                                    py: 1.5
                                }}
                            >
                                ⊕ New Song
                            </Button>
                        </Box>
                    )}
                </Box>
                
                <Box sx={{ 
                    width: '60%', 
                    bgcolor: '#FFF9E6', 
                    p: 3,
                    overflowY: 'auto'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Sort</InputLabel>
                            <Select
                                value={currentSort}
                                label="Sort"
                                onChange={handleSortChange}
                                sx={{ bgcolor: 'white' }}
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
                        
                        <Box sx={{ fontWeight: 'bold' }}>
                            {store.songs ? store.songs.length : 0} Songs
                        </Box>
                    </Box>
                    
                    <Box>
                        {songCards}
                    </Box>
                </Box>
            </Box>
            <MUIRemoveSongModal />
            <MUICreateSongModal />
            <MUIEditSongModal />
        </> 
    )
}