import { useReducer, createContext, useEffect, useState } from "react";
import { apiFetch, fetchCsrfToken } from "../lib/api";
import { useRouter } from 'next/router'
import { toast } from "react-toastify";

const initialState = {
    user: null,
    authReady: false
}

const Context = createContext()

const rootReducer = (state, action) => {
    switch(action.type) {
        case "SET_USER" : 
            return {...state, user: action.payload.user, authReady: true }
        case "LOGOUT" :
            return {...state, user: null, authReady: true}
        default: return state;
    }
}

const Provider = ({children}) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);
    const [token, setToken] = useState('');
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch('/api/current-user');
                const {ok, user} = await res.json();
                
                if(!res.ok || !ok) {
                    onUnAuthorized()
                } else {
                    localStorage.setItem("user", JSON.stringify(user));
                    dispatch({type: "SET_USER", payload: {user, authReady: true}});
                }
                
            } catch {
                dispatch({type: "LOGOUT"});
            }
        })();
    }, []);

    useEffect( ()=> {
        (async () => {
            try {
                setToken(await fetchCsrfToken());
            } catch {
                toast.error('invalid csrf token');
            }
        })();
    },[]);

    return <Context.Provider value={{state, dispatch, token}} >{children}</Context.Provider>
}

export {Context, Provider}