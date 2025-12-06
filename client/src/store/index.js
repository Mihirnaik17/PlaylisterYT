import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {jsTPS} from "jstps"
import storeRequestSender from './requests'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction'
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction'
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction'
import AuthContext from '../auth'

import songApi from './SongRequests'

/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});
console.log("create GlobalStoreContext");

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    EDIT_SONG: "EDIT_SONG",
    REMOVE_SONG: "REMOVE_SONG",
    HIDE_MODALS: "HIDE_MODALS",
    OPEN_EDIT_PLAYLIST_MODAL: "OPEN_EDIT_PLAYLIST_MODAL",
    OPEN_PLAY_PLAYLIST_MODAL: "OPEN_PLAY_PLAYLIST_MODAL",

    LOAD_SONGS: "LOAD_SONGS",
    SET_CURRENT_SONG: "SET_CURRENT_SONG",
    MARK_SONG_FOR_DELETION: "MARK_SONG_FOR_DELETION",
    CREATE_SONG_MODAL: "CREATE_SONG_MODAL",
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    EDIT_PLAYLIST : "EDIT_PLAYLIST",
    PLAY_PLAYLIST : "PLAY_PLAYLIST",
    ERROR : "ERROR",
    REMOVE_SONG : "REMOVE_SONG",
    CREATE_SONG : "CREATE_SONG"
}

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        currentModal : CurrentModal.NONE,
        idNamePairs: [],
        currentList: null,
        currentSongIndex : -1,
        currentSong : null,
        newListCounter: 0,
        listNameActive: false,
        listIdMarkedForDeletion: null,
        listMarkedForDeletion: null,


        // for song catalog 
        songs: [],              
        songIdMarkedForDeletion: null,  
    });
    const history = useHistory();

    console.log("inside useGlobalStore");

    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);
    console.log("auth: " + auth);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.playlist,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                })
            }
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {                
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter + 1,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: payload,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    currentModal : CurrentModal.DELETE_LIST,
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: payload.id,
                    listMarkedForDeletion: payload.playlist,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    currentModal : CurrentModal.EDIT_PLAYLIST,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: true,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            // 
            case GlobalStoreActionType.EDIT_SONG: {
                return setStore({
                    currentModal : CurrentModal.EDIT_SONG,
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.REMOVE_SONG: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.HIDE_MODALS: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.OPEN_EDIT_PLAYLIST_MODAL: {
                return setStore({
                    currentModal : CurrentModal.EDIT_PLAYLIST,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.OPEN_PLAY_PLAYLIST_MODAL: {
                return setStore({
                    currentModal : CurrentModal.PLAY_PLAYLIST,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    songs: store.songs,
                    songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.LOAD_SONGS: {
                return setStore({
                currentModal : CurrentModal.NONE,
                idNamePairs: store.idNamePairs,
                currentList: store.currentList,
                currentSongIndex: -1,
                currentSong: null,
                newListCounter: store.newListCounter,
                listNameActive: false,
                listIdMarkedForDeletion: null,
                listMarkedForDeletion: null,
                songs: payload,  
                songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.SET_CURRENT_SONG: {
                return setStore({
                currentModal : CurrentModal.NONE,
                idNamePairs: store.idNamePairs,
                currentList: store.currentList,
                currentSongIndex: store.currentSongIndex,
                currentSong: payload, 
                newListCounter: store.newListCounter,
                listNameActive: false,
                listIdMarkedForDeletion: null,
                listMarkedForDeletion: null,
                songs: store.songs,
                songIdMarkedForDeletion: null,
                });
            }
            case GlobalStoreActionType.MARK_SONG_FOR_DELETION: {
                return setStore({
                currentModal : CurrentModal.REMOVE_SONG, 
                idNamePairs: store.idNamePairs,
                currentList: store.currentList,
                currentSongIndex: store.currentSongIndex,
                currentSong: store.currentSong,
                newListCounter: store.newListCounter,
                listNameActive: false,
                listIdMarkedForDeletion: null,
                listMarkedForDeletion: null,
                songs: store.songs,
                songIdMarkedForDeletion: payload,  
                });
            }
            case GlobalStoreActionType.CREATE_SONG_MODAL: {
                return setStore({
                currentModal : CurrentModal.CREATE_SONG,
                idNamePairs: store.idNamePairs,
                currentList: store.currentList,
                currentSongIndex: store.currentSongIndex,
                currentSong: null,
                newListCounter: store.newListCounter,
                listNameActive: false,
                listIdMarkedForDeletion: null,
                listMarkedForDeletion: null,
                songs: store.songs,
                songIdMarkedForDeletion: null,
                });
            }



            default:
                return store;
        }
    }

    store.tryAcessingOtherAccountPlaylist = function(){
        let id = "635f203d2e072037af2e6284";
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: playlist
                });
            }
        }
        asyncSetCurrentList(id);
        history.push("/playlist/635f203d2e072037af2e6284");
    }

    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                playlist.name = newName;
                async function updateList(playlist) {
                    response = await storeRequestSender.updatePlaylistById(playlist.id || playlist._id, playlist);
                    if (response.data.success) {
                        async function getListPairs(playlist) {
                            response = await storeRequestSender.getPlaylistPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        playlist: playlist
                                    }
                                });
                            }
                        }
                        getListPairs(playlist);
                    }
                }
                updateList(playlist);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
        tps.clearAllTransactions();
    }

    // THIS FUNCTION CREATES A NEW LIST
store.createNewList = async function () {
    let newListName = "Untitled" + store.newListCounter;
    const response = await storeRequestSender.createPlaylist(newListName, [], auth.user.email);
    console.log("createNewList response: " + response);
    if (response.status === 201) {
        tps.clearAllTransactions();
        let newList = response.data.playlist;
        
        storeReducer({
            type: GlobalStoreActionType.OPEN_EDIT_PLAYLIST_MODAL,
            payload: newList
        });
    }
    else {
        console.log("FAILED TO CREATE A NEW LIST");
    }
}
    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            let response;
            if (auth.isGuest) {
                response = await storeRequestSender.getPublishedPlaylists();
            } else {
                response = await storeRequestSender.getPlaylistPairs();
            }
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs || response.data.data;
                console.log(pairsArray);
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }
    store.copyPlaylist = async function(playlistId) {
    try {
        const response = await storeRequestSender.getPlaylistById(playlistId);
        if (response.data.success) {
            const originalPlaylist = response.data.playlist;
            const newName = "Copy of " + originalPlaylist.name;
            const songs = originalPlaylist.songs || [];
            
            const createResponse = await storeRequestSender.createPlaylist(newName, songs, auth.user.email);
            if (createResponse.status === 201) {
                store.loadIdNamePairs();
                return { success: true };
            }
        }
        return { success: false };
    } catch (error) {
        console.error('Error copying playlist:', error);
        return { success: false };
    }
}
    // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = function (id) {
        async function getListToDelete(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: {id: id, playlist: playlist}
                });
            }
        }
        getListToDelete(id);
    }
    store.deleteList = function (id) {
        async function processDelete(id) {
            let response = await storeRequestSender.deletePlaylistById(id);
            //store.loadIdNamePairs();
            if (response.data.success) {
                //history.push("/");
                store.loadIdNamePairs();
            }
        }
        processDelete(id);
    }
    store.deleteMarkedList = function() {
        store.deleteList(store.listIdMarkedForDeletion);
        store.hideModals();
        
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST

    store.showEditSongModal = (songIndex, songToEdit) => {
        storeReducer({
            type: GlobalStoreActionType.EDIT_SONG,
            payload: {currentSongIndex: songIndex, currentSong: songToEdit}
        });        
    }
    store.showCreateSongModal = function() {
        storeReducer({
            type: GlobalStoreActionType.CREATE_SONG_MODAL,
            payload: null
        });
    }
    store.hideModals = () => {
        auth.errorMessage = null;
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }
    store.isDeleteListModalOpen = () => {
        return store.currentModal === CurrentModal.DELETE_LIST;
    }
    store.isEditSongModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_SONG;
    }
    store.isEditPlaylistModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_PLAYLIST;
    }
    store.isPlayPlaylistModalOpen = () => {
        return store.currentModal === CurrentModal.PLAY_PLAYLIST;
    }
    store.isErrorModalOpen = () => {
        return store.currentModal === CurrentModal.ERROR;
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;

                response = await storeRequestSender.updatePlaylistById(playlist.id || playlist._id, playlist);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: playlist
                    });
                    history.push("/playlist/" + (playlist.id || playlist._id));
                }
            }
        }
        asyncSetCurrentList(id);
    }

    store.openEditPlaylistModal = function (id) {
        async function asyncOpenEditPlaylistModal(id) {
            try {
                let response = await storeRequestSender.getPlaylistById(id);
                if (response.data.success) {
                    let playlist = response.data.playlist;
                    tps.clearAllTransactions();
                    storeReducer({
                        type: GlobalStoreActionType.OPEN_EDIT_PLAYLIST_MODAL,
                        payload: playlist
                    });
                }
            } catch (error) {
                console.error("Error opening edit modal:", error);
            }
        }
        asyncOpenEditPlaylistModal(id);
    }

    store.openPlayPlaylistModal = function (id) {
        async function asyncOpenPlayPlaylistModal(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.data.success) {
                let playlist = response.data.playlist;
                await storeRequestSender.incrementListens(id);
                storeReducer({
                    type: GlobalStoreActionType.OPEN_PLAY_PLAYLIST_MODAL,
                    payload: playlist
                });
            }
        }
        asyncOpenPlayPlaylistModal(id);
    }

    store.publishPlaylist = function (id) {
        async function asyncPublishPlaylist(id) {
            let response = await storeRequestSender.publishPlaylist(id, true);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncPublishPlaylist(id);
    }

    store.unpublishPlaylist = function (id) {
        async function asyncUnpublishPlaylist(id) {
            let response = await storeRequestSender.publishPlaylist(id, false);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncUnpublishPlaylist(id);
    }

    store.likePlaylist = function (id) {
        async function asyncLikePlaylist(id) {
            let response = await storeRequestSender.likePlaylist(id);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncLikePlaylist(id);
    }

    store.dislikePlaylist = function (id) {
        async function asyncDislikePlaylist(id) {
            let response = await storeRequestSender.dislikePlaylist(id);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncDislikePlaylist(id);
    }

    store.addComment = function (id, comment) {
        async function asyncAddComment(id, comment) {
            let response = await storeRequestSender.addComment(id, comment);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncAddComment(id, comment);
    }

    store.deleteComment = function (id, commentIndex) {
        async function asyncDeleteComment(id, commentIndex) {
            let response = await storeRequestSender.deleteComment(id, commentIndex);
            if (response.data.success) {
                store.loadIdNamePairs();
            }
        }
        asyncDeleteComment(id, commentIndex);
    }

    store.searchPlaylists = function (query) {
        async function asyncSearchPlaylists(query) {
            let response = await storeRequestSender.searchPlaylists(query);
            if (response.data.success) {
                let pairsArray = response.data.data;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
        }
        asyncSearchPlaylists(query);
    }

    store.getPublishedPlaylists = function () {
        async function asyncGetPublishedPlaylists() {
            let response = await storeRequestSender.getPublishedPlaylists();
            if (response.data.success) {
                let pairsArray = response.data.data;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
        }
        asyncGetPublishedPlaylists();
    }

    store.getPlaylistsByUsername = function (username) {
        async function asyncGetPlaylistsByUsername(username) {
            let response = await storeRequestSender.getPlaylistsByUsername(username);
            if (response.data.success) {
                let pairsArray = response.data.data;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
        }
        asyncGetPlaylistsByUsername(username);
    }

    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }
    // THIS FUNCTION ADDS A NEW SONG TO THE CURRENT PLAYLIST
    store.addNewSong = () => {
        let playlistSize = store.getPlaylistSize();
        store.addCreateSongTransaction(
            playlistSize, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
    // THIS FUNCTION CREATES A NEW SONG IN THE CURRENT LIST
    // USING THE PROVIDED DATA AND PUTS THIS SONG AT INDEX
    store.createSong = function(index, song) {
        let list = store.currentList;      
        list.songs.splice(index, 0, song);
        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    store.moveSong = function(start, end) {
        let list = store.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION REMOVES THE SONG AT THE index LOCATION
    // FROM THE CURRENT LIST
    store.removeSong = function(index) {
        let list = store.currentList;      
        list.songs.splice(index, 1); 

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCTION UPDATES A SONG IN THE CURRENT PLAYLIST AT index
    store.updatePlaylistSong = function(index, songData) {
        let list = store.currentList;
        let song = list.songs[index];
        song.title = songData.title;
        song.artist = songData.artist;
        song.year = songData.year;
        song.youTubeId = songData.youTubeId;

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
    store.addCreateSongTransaction = (index, title, artist, year, youTubeId) => {
        // ADD A SONG ITEM AND ITS NUMBER
        let song = {
            title: title,
            artist: artist,
            year: year,
            youTubeId: youTubeId
        };
        let transaction = new CreateSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }    
    store.addMoveSongTransaction = function (start, end) {
        let transaction = new MoveSong_Transaction(store, start, end);
        tps.processTransaction(transaction);
    }
    // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
    store.addRemoveSongTransaction = (song, index) => {
        //let index = store.currentSongIndex;
        //let song = store.currentList.songs[index];
        let transaction = new RemoveSong_Transaction(store, index, song);
        tps.processTransaction(transaction);
    }
    store.addUpdateSongTransaction = function (index, newSongData) {
        let song = store.currentList.songs[index];
        let oldSongData = {
            title: song.title,
            artist: song.artist,
            year: song.year,
            youTubeId: song.youTubeId
        };
        let transaction = new UpdateSong_Transaction(this, index, oldSongData, newSongData);        
        tps.processTransaction(transaction);
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await storeRequestSender.updatePlaylistById(store.currentList.id || store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.OPEN_EDIT_PLAYLIST_MODAL,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }
    store.canAddNewSong = function() {
        return (store.currentList !== null);
    }
    store.canUndo = function() {
        return ((store.currentList !== null) && tps.hasTransactionToUndo());
    }
    store.canRedo = function() {
        return ((store.currentList !== null) && tps.hasTransactionToDo());
    }
    store.canClose = function() {
        return (store.currentList !== null);
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }
    
    // SONG CATALOG FUNCTIONS
    store.loadSongs = async function(searchParams = {}) {
    try {
        const response = await songApi.getAllSongs(searchParams);
        if (response.data.success) {
            storeReducer({
                type: GlobalStoreActionType.LOAD_SONGS,
                payload: response.data.songs
            });
        }
    } catch (error) {
        console.error("Error loading songs:", error);
    }
    }

    store.createCatalogSong = async function(songData) {
    try {
        const response = await songApi.createSong(songData);
        if (response.data.success) {
            await store.loadSongs();
        }
        return response;
    } catch (error) {
        console.error("Error creating song:", error);
        throw error;
    }
    }

    store.updateCatalogSong = async function(id, songData) {
    try {
        const response = await songApi.updateSong(id, songData);
        if (response.data.success) {
            await store.loadSongs();
        }
        return response;
    } catch (error) {
        console.error("Error updating song:", error);
        throw error;
    }
    }
    
    store.markSongForDeletion = function(songId) {
    storeReducer({
        type: GlobalStoreActionType.MARK_SONG_FOR_DELETION,
        payload: songId
    });
    }

    store.deleteCatalogSong = async function(id) {
    try {
        const response = await songApi.deleteSong(id);
        if (response.data.success) {
            await store.loadSongs();
        }
        return response;
    } catch (error) {
        console.error("Error deleting song:", error);
        throw error;
    }
    }

    store.setCurrentSong = function(song) {
    storeReducer({
        type: GlobalStoreActionType.SET_CURRENT_SONG,
        payload: song
    });
    }

    store.addSongToPlaylist = async function(playlistId, songId) {
    try {
        const response = await storeRequestSender.addSongToPlaylist(playlistId, songId);
        if (response.data.success) {
            store.loadIdNamePairs();
            return { success: true };
        }
        return { success: false, error: response.data.error };
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        return { success: false, error: error.message };
    }
    }   

    function KeyPress(event) {
        if (!store.modalOpen && event.ctrlKey){
            if(event.key === 'z'){
                store.undo();
            } 
            if(event.key === 'y'){
                store.redo();
            }
        }
    }
  
    document.onkeydown = (event) => KeyPress(event);

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };