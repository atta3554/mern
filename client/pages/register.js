import { useState } from "react"
import { toast } from "react-toastify"
import { SyncOutlined } from "@ant-design/icons"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import GuestOnly from "@/components/wrappers/users/GuestOnly"

const register = () => {

    //prepare register states
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [spinner, setSpinner] = useState(false);
    
    //handle user registeration
    const handleRegisterFormSubmit = async e => {
        e.preventDefault()
        
        //set fetch config option
        let fetchConfig = {
            method: "POST",
            body: JSON.stringify({
                name,
                email, 
                password
            }),
            headers: {
                "Content-type": "application/json"
            }
        }

        try {
            //fetch data from backend
            setSpinner(true);
            let res = await apiFetch(`/api/register`, fetchConfig);
            let data = await res.json();
            
            //error if network failed
            if(!res.ok) {
                throw new Error('an error occured');
            }

            //log in if success
            if(data.ok === true) {
                setSpinner(false);
                toast.success('wow! you registered successfully', { position: "top-left" } );
                setEmail("");
                setName("");
                setPassword("");
            }

            //error with server message
            else {
                throw new Error(data.message);
            }

        } catch(err) {
            //show error message
            setSpinner(false);
            toast.error(err.message, {position: "top-left"});
        }
    }

    return (
        <GuestOnly>
            <div style={{border: "1px solid rgba(0, 0, 0, 0.2)", padding: "20px", borderRadius: "8px", width: '30%', margin: "100px auto"}} className="container">
                <h1 className="register text-center pt-4">provide us valid info</h1>
                <form style={{display: "flex", flexDirection: "column", rowGap: "20px"}} onSubmit={handleRegisterFormSubmit}>
                    <label className="d-flex flex-column" htmlFor="name">
                        <span className="mb-2" >please enter your name</span>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" name="name" id="name" placeholder="enter your name" autoComplete="name" />
                    </label>

                    <label className="d-flex flex-column" htmlFor="email">
                        <span className="mb-2" >please enter your email</span>
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" name="email" id="email" placeholder="enter your email" autoComplete="email" />
                    </label>

                    <label className="d-flex flex-column" htmlFor="password">
                        <span className="mb-2" >please enter your password</span>
                        <input value={password} onChange={e => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="enter your password" autoComplete="new-password" />
                    </label>

                    <button disabled={!name || !email || !password || spinner} type="submit" className="btn btn-block btn-primary p-2">
                        {spinner ? <SyncOutlined spin /> : "submit"}
                    </button>
                    <p className="text-center">already have account? <strong><Link href="/login">Login</Link></strong></p>
                </form>
            </div>
        </GuestOnly>
    )
}

export default register;