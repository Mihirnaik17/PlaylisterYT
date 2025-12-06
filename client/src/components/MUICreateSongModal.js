import { useContext, useState } from 'react'
import GlobalStoreContext from '../store';
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 345,
    height: 250,
    backgroundSize: "contain",
    backgroundImage: `url(https://i.insider.com/602ee9ced3ad27001837f2ac?})`,
    border: '3px solid #000',
    padding: '20px',
    boxShadow: 24,
};

export default function MUICreateSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const [ title, setTitle ] = useState('');
    const [ artist, setArtist ] = useState('');
    const [ year, setYear ] = useState('');
    const [ youTubeId, setYouTubeId ] = useState('');

    async function handleConfirmCreateSong() {
        let newSongData = {
            title: title,
            artist: artist,
            year: parseInt(year),
            youTubeId: youTubeId
        };
        await store.createSong(newSongData);
        handleCancelCreateSong();
    }

    function handleCancelCreateSong() {
        setTitle('');
        setArtist('');
        setYear('');
        setYouTubeId('');
        store.hideModals();
    }

    function handleUpdateTitle(event) {
        setTitle(event.target.value);
    }

    function handleUpdateArtist(event) {
        setArtist(event.target.value);
    }

    function handleUpdateYear(event) {
        setYear(event.target.value);
    }

    function handleUpdateYouTubeId(event) {
        setYouTubeId(event.target.value);
    }

    return (
        <Modal
            open={store.currentModal === "CREATE_SONG"}
        >
        <Box sx={style1}>
            <div id="create-song-modal" data-animation="slideInOutLeft">
            <Typography 
                sx={{fontWeight: 'bold'}} 
                id="create-song-modal-title" variant="h4" component="h2">
                Create Song
            </Typography>
            <Divider sx={{borderBottomWidth: 5, p: '5px', transform: 'translate(-5.5%, 0%)', width:377}}/>
            <Typography 
                sx={{mt: "10px", color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-title" variant="h6" component="h2">
                Title: <input id="create-song-modal-title-textfield" className='modal-textfield' type="text" value={title} onChange={handleUpdateTitle} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-artist" variant="h6" component="h2">
                Artist: <input id="create-song-modal-artist-textfield" className='modal-textfield' type="text" value={artist} onChange={handleUpdateArtist} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-year" variant="h6" component="h2">
                Year: <input id="create-song-modal-year-textfield" className='modal-textfield' type="text" value={year} onChange={handleUpdateYear} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"25px"}} 
                id="modal-modal-youTubeId" variant="h6" component="h2">
                YouTubeId: <input id="create-song-modal-youTubeId-textfield" className='modal-textfield' type="text" value={youTubeId} onChange={handleUpdateYouTubeId} />
            </Typography>
            <Button 
                sx={{color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px"}} variant="outlined" 
                id="create-song-confirm-button" onClick={handleConfirmCreateSong}>Confirm</Button>
            <Button 
                sx={{opacity: 0.80, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px", ml:"197px"}} variant="outlined" 
                id="create-song-confirm-button" onClick={handleCancelCreateSong}>Cancel</Button>
            </div>
        </Box>
        </Modal>
    );
}