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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import Skeleton from '@mui/material/Skeleton';

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
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        setCurrentPage(1);
        // Always show the global published feed on the Playlists page
        // (guests and logged-in users).
        store.loadPublishedPage(1);
    }, [auth.isGuest, auth.loggedIn, store]);

    useEffect(() => {
        if (store.idNamePairs) {
            setFilteredPlaylists(store.idNamePairs);
            setLoading(false);
        }
    }, [store.idNamePairs]);

    function handlePageChange(newPage) {
        setLoading(true);
        setCurrentPage(newPage);
        store.loadPublishedPage(newPage);
    }

    function handleCreateNewList() {
        store.createNewList();
    }

    function handleSearch() {
        setLoading(true);
        const searchParams = {};
        
        if (searchName) searchParams.name = searchName;
        if (searchUser) searchParams.username = searchUser;
        if (searchSongTitle) searchParams.title = searchSongTitle;
        if (searchArtist) searchParams.artist = searchArtist;
        if (searchYear) searchParams.year = searchYear;
        
        if (Object.keys(searchParams).length === 0) {
            store.loadPublishedPage(1);
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
        setCurrentPage(1);
        store.loadPublishedPage(1);
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
                        width: { xs: '100%', md: '36%' },
                        flexShrink: { md: 0 },
                        minHeight: 0,
                        maxHeight: { xs: '44vh', md: '100%' },
                        overflowY: 'auto',
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
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
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
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

                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        bgcolor: 'background.default',
                        p: 3,
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            flexWrap: 'wrap',
                            gap: 1,
                        }}
                    >
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
                            {store._pagination
                                ? `${store._pagination.current.total ?? filteredPlaylists.length} playlists`
                                : `${filteredPlaylists ? filteredPlaylists.length : 0} playlists`
                            }
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 2 }}>
                        {loading ? (
                            <Box sx={{ mt: 1 }}>
                                {[...Array(5)].map((_, idx) => (
                                    <Skeleton
                                        key={`home-playlist-skeleton-${idx}`}
                                        variant="rounded"
                                        height={78}
                                        sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.08)' }}
                                    />
                                ))}
                            </Box>
                        ) : filteredPlaylists && filteredPlaylists.length > 0 ? listCard : (
                            <Box sx={{ textAlign: 'center', mt: 6 }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No playlists found
                                </Typography>
                                <Typography variant="body2" color="text.disabled">
                                    {auth.isGuest ? 'No published playlists yet.' : 'Create your first playlist with the button below.'}
                                </Typography>
                                <Button variant="text" onClick={handleClear} sx={{ mt: 1.5 }}>
                                    Clear search filters
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {store._pagination && store._pagination.current.totalPages > 1 && (
                        <Box
                            sx={{
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                py: 1.5,
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <IconButton
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                                sx={{ color: 'text.secondary', '&:not(:disabled):hover': { color: 'primary.main' } }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography variant="body2" color="text.secondary">
                                Page {currentPage} of {store._pagination.current.totalPages}
                            </Typography>
                            <IconButton
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= store._pagination.current.totalPages || loading}
                                sx={{ color: 'text.secondary', '&:not(:disabled):hover': { color: 'primary.main' } }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>
                    )}

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