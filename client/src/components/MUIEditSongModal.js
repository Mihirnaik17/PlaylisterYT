import { useContext, useState, useEffect } from 'react'
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
    backgroundColor: "#B4F4A8", 
    border: '3px solid #000',
    padding: '20px',
    boxShadow: 24
};


export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const [ title, setTitle ] = useState('');
    const [ artist, setArtist ] = useState('');
    const [ year, setYear ] = useState('');
    const [ youTubeId, setYouTubeId ] = useState('');

    useEffect(() => {
        console.log('Edit Song Modal - currentSong:', store.currentSong);
        console.log('Edit Song Modal - currentModal:', store.currentModal);
        console.log('Edit Song Modal - isOpen:', store.isEditSongModalOpen());
        
        if (store.currentSong) {
            setTitle(store.currentSong.title || '');
            setArtist(store.currentSong.artist || '');
            setYear(store.currentSong.year || '');
            setYouTubeId(store.currentSong.youTubeId || '');
        }
    }, [store, store.currentSong, store.currentModal]);

    async function handleConfirmEditSong() {
        const isCatalogSong = store.currentSong && store.currentSong._id && store.currentSongIndex === -1;
        
        if (isCatalogSong) {
            let newSongData = {
                title: title,
                artist: artist,
                year: parseInt(year),
                youTubeId: youTubeId
            };
            await store.updateCatalogSong(store.currentSong._id, newSongData);
            store.hideModals();
        } else {
            let newSongData = {
                title: title,
                artist: artist,
                year: year,
                youTubeId: youTubeId
            };
            store.addUpdateSongTransaction(store.currentSongIndex, newSongData);
        }
    }

    function handleCancelEditSong() {
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
            open={store.isEditSongModalOpen()}
        >
        <Box sx={style1}>
            <div id="edit-song-modal" data-animation="slideInOutLeft">
            <Typography 
                sx={{fontWeight: 'bold'}} 
                id="edit-song-modal-title" variant="h4" component="h2">
                Edit Song
            </Typography>
            <Divider sx={{borderBottomWidth: 5, p: '5px', transform: 'translate(-5.5%, 0%)', width:377}}/>
            <Typography 
                sx={{mt: "10px", color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-title" variant="h6" component="h2">
                Title: <input id="edit-song-modal-title-textfield" className='modal-textfield' type="text" value={title} onChange={handleUpdateTitle} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-artist" variant="h6" component="h2">
                Artist: <input id="edit-song-modal-artist-textfield" className='modal-textfield' type="text" value={artist} onChange={handleUpdateArtist} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"30px"}} 
                id="modal-modal-year" variant="h6" component="h2">
                Year: <input id="edit-song-modal-year-textfield" className='modal-textfield' type="text" value={year} onChange={handleUpdateYear} />
            </Typography>
            <Typography 
                sx={{color: "#702963", fontWeight:"bold", fontSize:"25px"}} 
                id="modal-modal-youTubeId" variant="h6" component="h2">
                YouTubeId: <input id="edit-song-modal-youTubeId-textfield" className='modal-textfield' type="text" value={youTubeId} onChange={handleUpdateYouTubeId} />
            </Typography>
            <Button 
                sx={{color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px"}} variant="outlined" 
                id="edit-song-confirm-button" onClick={handleConfirmEditSong}>Confirm</Button>
            <Button 
                sx={{opacity: 0.80, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"20px", ml:"197px"}} variant="outlined" 
                id="edit-song-confirm-button" onClick={handleCancelEditSong}>Cancel</Button>
            </div>
        </Box>
        </Modal>
    );
}