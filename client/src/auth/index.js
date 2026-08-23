import React, { createContext, useEffect, useState, useCallback } from "react";
import { useHistory } from 'react-router-dom'
import authRequestSender from './requests'

const AuthContext = createContext();

export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
    GUEST_MODE: "GUEST_MODE",
    CLEAR_ERROR: "CLEAR_ERROR"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        isGuest: false,
        errorMessage: null,
        authReady: false
    });
    const history = useHistory();

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    errorMessage: null,
                    authReady: true
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    errorMessage: payload.errorMessage,
                    authReady: true
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: false,
                    errorMessage: null,
                    authReady: true
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    errorMessage: payload.errorMessage,
                    authReady: true
                })
            }
            case AuthActionType.GUEST_MODE: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: true,
                    errorMessage: null,
                    authReady: true
                })
            }
            case AuthActionType.CLEAR_ERROR: {
                return setAuth((prev) => ({
                    ...prev,
                    errorMessage: null
                }))
            }
            default:
                return auth;
        }
    }

    const getLoggedIn = useCallback(async () => {
        try {
            const response = await authRequestSender.getLoggedIn();
            const isLoggedIn = response.status === 200 && response.data.loggedIn;
            const isGuest = !isLoggedIn && sessionStorage.getItem('guestMode') === '1';
            setAuth({
                user: isLoggedIn ? response.data.user : null,
                loggedIn: isLoggedIn,
                isGuest,
                errorMessage: null,
                authReady: true
            });
        } catch (e) {
            const isGuest = sessionStorage.getItem('guestMode') === '1';
            setAuth(prev => ({ ...prev, isGuest, authReady: true }));
        }
    }, []);

    useEffect(() => {
        getLoggedIn();
    }, [getLoggedIn]);

    auth.getLoggedIn = getLoggedIn;

    auth.registerUser = async function(firstName, lastName, username, email, password, passwordVerify, avatar) {
        try{   
            const response = await authRequestSender.registerUser(firstName, lastName, username, email, password, passwordVerify, avatar);   
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: null,
                        loggedIn: false,
                        errorMessage: null
                    }
                })
                history.push("/login");
            }
        } catch(error){
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: error.response?.data?.errorMessage || error.message || "Registration failed. Please check your connection."
                }
            })
        }
    }

    auth.loginUser = async function(email, password) {
        try{
            const data = await authRequestSender.loginUser(email, password);
            if (data.data && data.data.success) {
                sessionStorage.removeItem('guestMode');
               authReducer({
                   type: AuthActionType.LOGIN_USER,
                   payload: {
                       user: data.data.user,
                       loggedIn: true,
                        errorMessage: null
                    }
                })
                history.push("/home");
            }
        } catch(error){
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: error.response?.data?.errorMessage || error.message 
                }
            })
        }
    }
    
    auth.logoutUser = async function() {
        const response = await authRequestSender.logoutUser();
        if (response.status === 200) {
            sessionStorage.removeItem('guestMode');
            authReducer( {
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            history.push("/");
        }
    }

        auth.getUserInitials = function() {
        let initials = "";
        if (auth.user) {
            if (auth.user.username && auth.user.username.length > 0) {
                initials += auth.user.username.charAt(0).toUpperCase();
                if (auth.user.username.length > 1) {
                    initials += auth.user.username.charAt(1).toUpperCase();
                }
            } else {
                initials += auth.user.firstName.charAt(0);
                initials += auth.user.lastName.charAt(0);
            }
        }
        return initials;
    }


    auth.clearError = function() {
        authReducer({
            type: AuthActionType.CLEAR_ERROR,
            payload: null
        })
    }

    auth.continueAsGuest = function() {
        sessionStorage.setItem('guestMode', '1');
        authReducer({
            type: AuthActionType.GUEST_MODE,
            payload: null
        })
        history.push("/home");
    }

        auth.editUser = async function(username, email, password, passwordVerify, avatar) {
        try{
            const response = await authRequestSender.editUser(username, email, password, passwordVerify, avatar);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user,
                        loggedIn: true,
                        errorMessage: null
                    }
                })
                history.push("/home");
            }
        } catch(error){
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: auth.user,
                    loggedIn: true,
                    errorMessage: error.response?.data?.errorMessage || error.message
                }
            })
        }
    }


    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };
