// API for song-related requests
// handles communication with backend song endpoints

import { getApiBaseUrl } from '../../config/apiBase';

const baseURL = getApiBaseUrl();

const handleresponse = async (response) => {
    if(!response.ok){
        let errormsg = `HTTP error status: ${response.status}`;
        let err
        try{
            err = await response.json();
            errormsg = err.errorMessage || JSON.stringify(err);
        } catch(e){
            err = {errorMessage: response.statusText};
            errormsg = response.statusText;
        } throw {
            response:{
                data: err,
                status: response.status
            },
            message: errormsg
        };
    }   
    try{
        const jsonData = await response.json();
        return {data: jsonData, status: response.status};
    } catch(e){
        return { data: "", status: response.status };
    }
}

// Get all songs with optional serch/sort paramters
export const getAllSongs = async (searchParams = {}) => {
    try{
        const queryParams = new URLSearchParams();
        
        if (searchParams.title) queryParams.append('title', searchParams.title);
        if (searchParams.artist) queryParams.append('artist', searchParams.artist);
        if (searchParams.year) queryParams.append('year', searchParams.year);
        if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);
        if (searchParams.sortOrder) queryParams.append('sortOrder', searchParams.sortOrder);
        
        const url = `${baseURL}/songs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

// Get a specfic song by ID
export const getSongById = async (id) => {
    try{
        const response = await fetch(`${baseURL}/song/${id}`, {
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

// Create a new song in the catelog
export const createSong = async (songData) => {
    const payload = {
        title: songData.title,
        artist: songData.artist,
        year: songData.year,
        youTubeId: songData.youTubeId
    };

    try{
        const response = await fetch(`${baseURL}/song`, {
            method: 'POST',
            credentials: "include",
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

// Update an existing song
export const updateSong = async (id, songData) => {
    const payload = {
        title: songData.title,
        artist: songData.artist,
        year: songData.year,
        youTubeId: songData.youTubeId
    };

    try{
        const response = await fetch(`${baseURL}/song/${id}`, {
            method: 'PUT',
            credentials: "include",
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

// Delete a song from the catelog
export const deleteSong = async (id) => {
    try{
        const response = await fetch(`${baseURL}/song/${id}`, {
            method: 'DELETE',
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

// Get all songs created by the loged-in user
export const getUserSongs = async () => {
    try{
        const response = await fetch(`${baseURL}/songs/user`, {
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const lookupSong = async ({ title, artist, year }) => {
    const queryParams = new URLSearchParams();
    if (title) queryParams.append('title', title);
    if (artist) queryParams.append('artist', artist);
    if (year !== undefined && year !== null) queryParams.append('year', year);

    try {
        const response = await fetch(`${baseURL}/songs/lookup?${queryParams.toString()}`, {
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const likeSong = async (songId) => {
    try {
        const response = await fetch(`${baseURL}/song/${songId}/like`, {
            method: 'POST',
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const apis = {
    getAllSongs,
    getSongById,
    createSong,
    updateSong,
    deleteSong,
    getUserSongs,
    lookupSong,
    likeSong
}

export default apis;
