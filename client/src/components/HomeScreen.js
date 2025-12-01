import { useContext, useEffect, useState } from 'react'
import { GlobalStoreContext } from '../store'
import PlaylistCard from './PlaylistCard.js'
import MUIDeleteModal from './MUIDeleteModal'
import NavigationBar from './NavigationBar'

import AddIcon from '@mui/icons-material/Add';
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

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);
    const [searchName, setSearchName] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [searchSongTitle, setSearchSongTitle] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [sortBy, setSortBy] = useState('Listeners (Hi-Lo)');
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    function handleCreateNewList() {
        store.createNewList();
    }

    function handleSearch() {
        console.log('Search clicked');
    }

    function handleClear() {
        setSearchName('');
        setSearchUser('');
        setSearchSongTitle('');
        setSearchArtist('');
        setSearchYear('');
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
    }

    let listCard = "";
    if (store) {
        listCard = store.idNamePairs.map((pair) => (
            <PlaylistCard
                key={pair._id}
                idNamePair={pair}
                selected={false}
            />
        ));
    }

    return (
        <Box sx={{ height: '100vh', bgcolor: '#f0e6f6' }}>
            <NavigationBar />
            <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
                <Box sx={{ width: '35%', bgcolor: '#FFFACD', p: 3, borderRight: '2px solid #000' }}>
                    <Typography variant="h3" sx={{ color: '#9C27B0', fontWeight: 'bold', mb: 4 }}>
                        Playlists
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="by Playlist Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        sx={{ mb: 3, bgcolor: '#E8E8E8' }}
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
                        sx={{ mb: 3, bgcolor: '#E8E8E8' }}
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
                        sx={{ mb: 3, bgcolor: '#E8E8E8' }}
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
                        sx={{ mb: 3, bgcolor: '#E8E8E8' }}
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
                        sx={{ mb: 4, bgcolor: '#E8E8E8' }}
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

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            sx={{
                                bgcolor: '#7B68EE',
                                color: '#fff',
                                flex: 1,
                                '&:hover': { bgcolor: '#6A5ACD' }
                            }}
                        >
                            SEARCH
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClear}
                            sx={{
                                bgcolor: '#7B68EE',
                                color: '#fff',
                                flex: 1,
                                '&:hover': { bgcolor: '#6A5ACD' }
                            }}
                        >
                            CLEAR
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ width: '65%', bgcolor: '#FFFACD', p: 3, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">Sort:</Typography>
                            <Typography
                                variant="body1"
                                onClick={handleSortClick}
                                sx={{
                                    color: '#1976d2',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' }
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
                        <Typography variant="body1">
                            {store.idNamePairs ? store.idNamePairs.length : 0} Playlists
                        </Typography>
                    </Box>

                    <Box sx={{ height: 'calc(100% - 100px)', overflowY: 'auto' }}>
                        {listCard}
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateNewList}
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            bgcolor: '#7B68EE',
                            color: '#fff',
                            '&:hover': { bgcolor: '#6A5ACD' }
                        }}
                    >
                        NEW PLAYLIST
                    </Button>
                </Box>
            </Box>
            <MUIDeleteModal />
        </Box>
    );
}

export default HomeScreen;