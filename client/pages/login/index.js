import { useState, useContext } from "react"
import { Context } from "@/context/index.js"
import { useRouter } from "next/router.js"
import { SyncOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"
import Link from "next/link"
import styles from "./login.module.css"
import { apiFetch } from "@/context/api"
import GuestOnly from '@/components/wrappers/GuestOnly.js'

const Login = () => {

    //prepare global context
    const { onUnAuthorized, dispatch } = useContext(Context);

    //prepare router for redirect user
    const router = useRouter();

    //prepare login form states
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [remember, setRemember] = useState(false);
    const [spinner, setSpinner] = useState(false);

    //handle user login
    const handleLoginFormSubmit = async e => {
        e.preventDefault()
        
        //config login fetch request
        let fetchConfig = {
            method: "POST",
            body: JSON.stringify({
                email, 
                password,
                remember
            })
        }

        try {
            //send login request and throttle furthure requests
            setSpinner(true);

            let res = await apiFetch(`/api/login`, onUnAuthorized, fetchConfig);
            let data = await res.json();
            
            //send error if request failed
            if(!res.ok) {
                throw new Error(data);
            }

            //log in user if credentials are valid 
            if(data.ok === true) {
                
                //show successfull message
                setSpinner(false);
                toast.success('wow! you have logged in successfully. you will be redirect in a moment', { position: "top-left" } );

                //empty fields
                setEmail("");
                setPassword("");
                setRemember(false);

                //dispatch user data to global context
                dispatch({type: "SET_USER", payload: {user: data.user}});

                //save in localstorage for consistent data on page refresh
                localStorage.setItem("user", JSON.stringify(data.user))
            }

        } catch(err) {
            setSpinner(false);
            toast.error(err.message, {position: "top-left"});
        }
    }

    return (
        <GuestOnly>
            <div style={{border: "1px solid rgba(0, 0, 0, 0.2)", padding: "20px", borderRadius: "8px", width: '30%', margin: "100px auto"}} className="container">
                <h1 className="register text-center pt-4">enter your credentials</h1>
                <form style={{display: "flex", flexDirection: "column", rowGap: "20px"}} onSubmit={handleLoginFormSubmit}>

                    <label className={styles.label} htmlFor="email">
                        <span className={styles.span}>please enter your email</span>
                        <input value={email} onChange={e => setEmail(e.target.value)} className={styles.input} type="email" name="email" id="email" placeholder="enter your email" />
                    </label>

                    <label className={styles.label} htmlFor="password">
                        <span className={styles.span}>please enter your password</span>
                        <input value={password} onChange={e => setPassword(e.target.value)} className={styles.input} type="password" name="password" id="password" placeholder="enter your password" />
                    </label>

                    <label className="d-flex align-items-center" htmlFor="remember">
                        <span className="me-1">Remember?</span>
                        <input checked={remember} onChange={e => setRemember(!remember)} type="checkbox" name="remember" id="remember" />
                    </label>

                    <button disabled={!email || !password || spinner} type="submit" className="btn btn-block btn-primary p-2">
                        {spinner ? <SyncOutlined spin /> : "submit"}
                    </button>
                    <p className="text-center mb-0">don't have an account? <strong><Link href="/register">register</Link></strong></p>
                    <p className="text-center">forgot your password? <strong><Link href="/forgot-password">reset password</Link></strong></p>
                </form>
            </div>
        </GuestOnly>
    )
}

export default Login