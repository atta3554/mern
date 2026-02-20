import { useReducer, createContext, useEffect, useState } from "react";
import { apiFetch, fetchCsrfToken } from "./api";
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

    const onUnAuthorized = () => {
        localStorage.removeItem('user');
        dispatch({type: "LOGOUT"});
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch('/api/current-user', onUnAuthorized);
                if(res?.ok) {
                    const user = await res.json();
                    if(user) {                        
                        localStorage.setItem("user", JSON.stringify(user));
                        dispatch({type: "SET_USER", payload: {user, authReady: true}});
                    } else {
                        onUnAuthorized()
                    }
                } else {
                    onUnAuthorized();
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

    return <Context.Provider value={{state, dispatch, token, onUnAuthorized}} >{children}</Context.Provider>
}

export {Context, Provider}