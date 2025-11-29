/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: 'http://localhost:4000/auth',
// })

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

//Making the first initial commit 

const baseURL = 'http://localhost:4000/auth';

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
    //const contype = response.headers.get("content-type");
    try{
        const jsonData = await response.json();
        return {data: jsonData, status: response.status};
    } catch(e){
        return { data: "", status: response.status };
    }

}

export const getLoggedIn = async () => {
    try{
        const response = await fetch(`${baseURL}/loggedIn/`,{
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const loginUser = async (email, password) => {   
        // SPECIFY THE PAYLOAD
        const payload = {
        email : email,
        password : password
        };
        try{
            const response = await fetch(`${baseURL}/login/`,{
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

export const logoutUser = async () => {
    try{
        const response = await fetch(`${baseURL}/logout/`,{
            credentials: "include",
        });
        const data = await handleresponse(response);
        return data;
    } catch (error){
        console.error(error);
        throw error;
    }
}

export const registerUser = async (firstName, lastName, email, password, passwordVerify) => {   
        // SPECIFY THE PAYLOAD
        const payload = {
        firstName : firstName,
        lastName : lastName,
        email : email,
        password : password,
        passwordVerify : passwordVerify
        };
        try{
            const response = await fetch(`${baseURL}/register/`,{
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

// export const getLoggedIn = () => api.get(`/loggedIn/`);
// export const loginUser = (email, password) => {
//     return api.post(`/login/`, {
//         email : email,
//         password : password
//     })
// }
// export const logoutUser = () => api.get(`/logout/`)
// export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
//     return api.post(`/register/`, {
//         firstName : firstName,
//         lastName : lastName,
//         email : email,
//         password : password,
//         passwordVerify : passwordVerify
//     })
// }
const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis
