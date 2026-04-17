import { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import PlaylistCard from './PlaylistCard.js'
import MUIDeleteModal from './MUIDeleteModal'
import MUIEditPlaylistModal from './MUIEditPlaylistModal'
import MUIPlayPlaylistModal from './MUIPlayPlaylistModal'
import NavigationBar from './NavigationBar'
import AIRecommendationsDialog from './AIRecommendationsDialog'

import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const [searchName, setSearchName] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [searchSongTitle, setSearchSongTitle] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [sortBy, setSortBy] = useState('Listeners (Hi-Lo)');
    const [anchorEl, setAnchorEl] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);

    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        store.loadIdNamePairs();
    }, [auth.isGuest, auth.loggedIn]);

    useEffect(() => {
        if (store.idNamePairs) {
            setFilteredPlaylists(store.idNamePairs);
            setLoading(false);
        }
    }, [store.idNamePairs]);

    function handleCreateNewList() {
        store.createNewList();
    }

    function handleSearch() {
        const searchParams = {};
        
        if (searchName) searchParams.name = searchName;
        if (searchUser) searchParams.username = searchUser;
        if (searchSongTitle) searchParams.title = searchSongTitle;
        if (searchArtist) searchParams.artist = searchArtist;
        if (searchYear) searchParams.year = searchYear;
        
        if (Object.keys(searchParams).length === 0) {
            store.loadIdNamePairs();
        } else {
            store.searchPlaylists(searchParams);
        }
    }

    function handleClear() {
        setSearchName('');
        setSearchUser('');
        setSearchSongTitle('');
        setSearchArtist('');
        setSearchYear('');
        setFilteredPlaylists(store.idNamePairs);
        store.loadIdNamePairs();
    }

    function handleSortClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleSortClose() {
        setAnchorEl(null);
    }

    function handleSortSelect(sortOption) {
        setSortBy(sortOption);
        handleSortClose();

        let sorted = [...filteredPlaylists];
            switch(sortOption) {
        case 'Name (A-Z)':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'Name (Z-A)':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'User (A-Z)':
            sorted.sort((a, b) => (a.ownerEmail || '').localeCompare(b.ownerEmail || ''));
            break;
        case 'User (Z-A)':
            sorted.sort((a, b) => (b.ownerEmail || '').localeCompare(a.ownerEmail || ''));
            break;
        case 'Listeners (Hi-Lo)':
            sorted.sort((a, b) => (b.listens || 0) - (a.listens || 0));
            break;
        case 'Listeners (Lo-Hi)':
            sorted.sort((a, b) => (a.listens || 0) - (b.listens || 0));
            break;
        default:
            break;
        }

        setFilteredPlaylists(sorted);
    }

    let listCard = "";
    if (filteredPlaylists && filteredPlaylists.length > 0) {
        listCard = filteredPlaylists.map((pair) => (
            <PlaylistCard
                key={pair._id}
                idNamePair={pair}
                selected={false}
            />
        ));
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <NavigationBar />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 'calc(100vh - 72px)' }}>
                <Box
                    sx={{
                        width: { xs: '100%', md: '36%' },
                        bgcolor: 'background.paper',
                        p: 3,
                        borderRight: { md: 1 },
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Playlists
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Search published lists, then open one to play or copy.
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="by Playlist Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: searchName && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchName('')} edge="end">
                                    <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        placeholder="by User Name"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        sx={{ mb: 2 }}
                         InputProps={{
                            endAdornment: searchUser && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchUser('')} edge="end">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        placeholder="by Song Title"
                        value={searchSongTitle}
                        onChange={(e) => setSearchSongTitle(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: searchSongTitle && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchSongTitle('')} edge="end">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        placeholder="by Song Artist"
                        value={searchArtist}
                        onChange={(e) => setSearchArtist(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: searchArtist && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchArtist('')} edge="end">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        placeholder="by Song Year"
                        value={searchYear}
                        onChange={(e) => setSearchYear(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            endAdornment: searchYear && (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setSearchYear('')} edge="end">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button variant="contained" color="primary" startIcon={<SearchIcon />} onClick={handleSearch} sx={{ flex: 1 }}>
                            Search
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={handleClear} sx={{ flex: 1 }}>
                            Clear
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ flex: 1, bgcolor: 'background.default', p: 3, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Sort:
                            </Typography>
                            <Typography
                                variant="body2"
                                onClick={handleSortClick}
                                sx={{
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                {sortBy}
                            </Typography>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleSortClose}
                            >
                                <MenuItem onClick={() => handleSortSelect('Listeners (Hi-Lo)')}>Listeners (Hi-Lo)</MenuItem>
                                <MenuItem onClick={() => handleSortSelect('Listeners (Lo-Hi)')}>Listeners (Lo-Hi)</MenuItem>
                                <MenuItem onClick={() => handleSortSelect('Name (A-Z)')}>Name (A-Z)</MenuItem>
                                <MenuItem onClick={() => handleSortSelect('Name (Z-A)')}>Name (Z-A)</MenuItem>
                                <MenuItem onClick={() => handleSortSelect('User (A-Z)')}>User (A-Z)</MenuItem>
                                <MenuItem onClick={() => handleSortSelect('User (Z-A)')}>User (Z-A)</MenuItem>
                            </Menu>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            {filteredPlaylists ? filteredPlaylists.length : 0} playlists
                        </Typography>
                    </Box>

                    <Box sx={{ maxHeight: { xs: 'none', md: 'calc(100vh - 220px)' }, overflowY: 'auto', pb: 10 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                <CircularProgress color="primary" />
                            </Box>
                        ) : filteredPlaylists && filteredPlaylists.length > 0 ? listCard : (
                            <Box sx={{ textAlign: 'center', mt: 6 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No playlists found
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    {auth.isGuest ? 'No published playlists yet.' : 'Create your first playlist with the button below.'}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {!auth.isGuest && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateNewList}
                            sx={{
                                position: 'fixed',
                                bottom: 24,
                                right: 24,
                                zIndex: 2,
                                boxShadow: 6,
                            }}
                        >
                            New playlist
                        </Button>
                    )}

                    <Tooltip title="AI song recommendations">
                        <Fab
                            color="secondary"
                            aria-label="ai recommendations"
                            onClick={() => setAiOpen(true)}
                            sx={{
                                position: 'fixed',
                                bottom: 24,
                                left: 24,
                                zIndex: 2,
                            }}
                        >
                            <AutoAwesomeIcon />
                        </Fab>
                    </Tooltip>
                </Box>
            </Box>
            <AIRecommendationsDialog open={aiOpen} onClose={() => setAiOpen(false)} playlistContext={[]} />
            <MUIDeleteModal />
            <MUIEditPlaylistModal />
            <MUIPlayPlaylistModal />
        </Box>
    );
}

export default HomeScreen;