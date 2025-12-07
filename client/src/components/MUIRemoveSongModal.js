import { useContext } from 'react'
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

export default function MUIRemoveSongModal() {
    const { store } = useContext(GlobalStoreContext);
    
    let songTitle = "";
    if (store.songIdMarkedForDeletion && store.songs) {
        const song = store.songs.find(s => s._id === store.songIdMarkedForDeletion);
        if (song) {
            songTitle = song.title;
        }
    }
    
    async function handleRemoveSong(event) {
        if (store.songIdMarkedForDeletion) {
            await store.deleteCatalogSong(store.songIdMarkedForDeletion);
        }
        store.hideModals();
    }
    
    function handleCloseModal(event) {
        store.hideModals();
    }

    return (
        <Modal
            open={store.currentModal === "REMOVE_SONG"}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style1}>
                <Typography sx={{fontWeight: 'bold'}} id="modal-modal-title" variant="h4" component="h2">
                    Remove Song?
                </Typography>
                <Divider sx={{borderBottomWidth: 5, p: '5px', transform: 'translate(-5.5%, 0%)', width:377}}/>
                <Box sx={{background: "rgb(172,79,198,0.05)"}}>
                    <Typography id="modal-modal-description" sx={{color: "#301974" ,fontWeight: 'bold', mt: 1}}>
                        Are you sure you want to remove <Box component="span" sx={{color: "#820747CF" ,fontWeight: 'bold', textDecoration: 'underline'}}>{songTitle}</Box> from the catalog?
                    </Typography>
                    <Typography variant="body2" sx={{color: "#301974", mt: 1, fontSize: '12px'}}>
                        Doing so will remove it from all of your playlists.
                    </Typography>
                </Box>
                <Button sx={{opacity: 0.7, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"40px", mr:"65px"}} variant="outlined" onClick={handleRemoveSong}> Remove Song </Button>
                <Button sx={{opacity: 0.50, color: "#8932CC", backgroundColor: "#CBC3E3", fontSize: 13, fontWeight: 'bold', border: 2, p:"5px", mt:"40px", ml:"72px"}} variant="outlined" onClick={handleCloseModal}> Cancel </Button>
            </Box>
        </Modal>
    );
}