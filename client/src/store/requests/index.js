// /*
//     This is our http api, which we use to send requests to
//     our back-end API. Note we`re using the Axios library
//     for doing this, which is an easy to use AJAX-based
//     library. We could (and maybe should) use Fetch, which
//     is a native (to browsers) standard, but Axios is easier
//     to use when sending JSON back and forth and it`s a Promise-
//     based API which helps a lot with asynchronous communication.
    
//     @author McKilla Gorilla
// */

// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: 'http://localhost:4000/store',
// })

// // THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// // REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// // REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// // WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// // WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// // CUSTOM FILTERS FOR QUERIES

import { getApiBaseUrl } from '../../config/apiBase';

const baseURL = getApiBaseUrl();

const handleresponse =  async (response) => {
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

export const createPlaylist = async (newListName, newSongs, userEmail) => {   
        const payload = {
        name: newListName,
        songs: newSongs,
        ownerEmail: userEmail
        };

        try{
            const response = await fetch(`${baseURL}/playlist/`,{
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

export const getPlaylistById = async (id) => {
    try{
        const response = await fetch(`${baseURL}/playlist/${id}`,{
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const getPlaylistPairs = async () => {
    try{
        const response = await fetch(`${baseURL}/playlistpairs/`,{
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const deletePlaylistById = async (id) => {
    try{
        const response = await fetch(`${baseURL}/playlist/${id}`,{
            method: 'DELETE',
            credentials: "include"
        });
        const data = await handleresponse(response);
           return data;
    }catch(error){
        console.error(error);
        throw error;
    }
}

export const updatePlaylistById = async (id, playlist) => {
    try{
            const response = await fetch(`${baseURL}/playlist/${id}`,{
            method: 'PUT',
            credentials: "include",
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playlist)
            });

            const data = await handleresponse(response);
            return data;
        } catch (error){
            console.error(error);
            throw error;
        }

}

export const publishPlaylist = async (id, published) => {
    const payload = {
        published: published
    };
    try{
        const response = await fetch(`${baseURL}/playlist/${id}/publish`,{
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

export const likePlaylist = async (id) => {
    try{
        const response = await fetch(`${baseURL}/playlist/${id}/like`,{
            method: 'PUT',
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const dislikePlaylist = async (id) => {
    try{
        const response = await fetch(`${baseURL}/playlist/${id}/dislike`,{
            method: 'PUT',
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const addComment = async (id, comment) => {
    const payload = {
        comment: comment
    };
    try{
        const response = await fetch(`${baseURL}/playlist/${id}/comment`,{
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

export const deleteComment = async (id, commentIndex) => {
    try{
        const response = await fetch(`${baseURL}/playlist/${id}/comment/${commentIndex}`,{
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

export const incrementListens = async (id) => {
    try{
        const response = await fetch(`${baseURL}/playlist/${id}/listen`,{
            method: 'PUT',
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const getPublishedPlaylists = async () => {
    try{
        const response = await fetch(`${baseURL}/playlists/published`,{
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const searchPlaylists = async (searchParams = {}) => {
    try{
        const queryParams = new URLSearchParams();
        
        if (searchParams.name) queryParams.append('name', searchParams.name);
        if (searchParams.username) queryParams.append('username', searchParams.username);
        if (searchParams.title) queryParams.append('title', searchParams.title);
        if (searchParams.artist) queryParams.append('artist', searchParams.artist);
        if (searchParams.year) queryParams.append('year', searchParams.year);
        
        const url = `${baseURL}/playlists/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await fetch(url, {
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const getPlaylistsByUsername = async (username) => {
    try{
        const response = await fetch(`${baseURL}/playlists/user/${username}`,{
            credentials: "include"
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const recommendSongs = async (payload) => {
    try {
        const response = await fetch(`${baseURL}/ai/recommend-songs`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await handleresponse(response);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const addSongToPlaylist = async (playlistId, songId) => {
    const payload = {
        songId: songId
    };
    try{
        const response = await fetch(`${baseURL}/playlist/${playlistId}/add-song`,{
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

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById,
    publishPlaylist,
    likePlaylist,
    dislikePlaylist,
    addComment,
    deleteComment,
    incrementListens,
    getPublishedPlaylists,
    searchPlaylists,
    getPlaylistsByUsername,
    addSongToPlaylist,
    recommendSongs,
}

export default apis