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


const baseURL = 'http://localhost:4000/store';

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
        // SPECIFY THE PAYLOAD
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

    const payload = {
        playlist: playlist
    };
    try{
            const response = await fetch(`${baseURL}/playlist/${id}`,{
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



// export const deletePlaylistById = (id) => api.delete(`/playlist/${id}`)
// export const getPlaylistById = (id) => api.get(`/playlist/${id}`)
// export const getPlaylistPairs = () => api.get(`/playlistpairs/`)
// export const updatePlaylistById = (id, playlist) => {
//     return api.put(`/playlist/${id}`, {
//         // SPECIFY THE PAYLOAD
//         playlist : playlist
//     })
// }

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis


//we are gonna create create playlist with fetch

