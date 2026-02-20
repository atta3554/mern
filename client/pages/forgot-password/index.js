import { useState, useContext } from "react"
import { Context } from "@/context/index.js"
import { SyncOutlined } from "@ant-design/icons"
import { toast } from "react-toastify"
import styles from "./forgotPassword.module.css"
import { apiFetch } from "@/context/api"
import GuestOnly from '@/components/wrappers/GuestOnly.js'

const forgotPassword = () => {

    //prepare global context
    const { onUnAuthorized } = useContext(Context);

    //prepare form states
    const [email, setEmail] = useState("");
    const [emailHolder, setEmailHolder] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [spinner, setSpinner] = useState(false);

    //handle sending email request
    const sendEmail = async e => {
        
        //throttle furthure requests
        e.preventDefault()
        setSpinner(true);
        
        //config request for send email
        let fetchConfig = {
            method: "POST",
            body: JSON.stringify({
                email,
            })
        }

        try {

            //send email 
            let res = await apiFetch(`/api/send-email`, onUnAuthorized, fetchConfig);
            
            //send error if request failed
            if(!res.ok) {
                throw new Error('failed to reset your password! please check your conectivity');
            }

            let data = await res.json();

            //log in user if credentials are valid 
            if(data.ok === true) {
                
                //show successfull message
                toast.success(data.message, { position: "top-left" } );

                //check email flag as sent
                setEmailSent(true);
                setEmailHolder(email)
                setEmail('');
            } else {
                //send backend error message
                throw new Error(data.message);
            }

        } catch(err) {
            //empty fields and show error
            toast.error(err.message, {position: "top-left"});
            setEmail("");
        }

        //hide spinner
        setSpinner(false);
    }

    //handle sent code request
    const sendCode = async e => {
        
        //throttle furthure requests
        e.preventDefault();
        setSpinner(true);

        //config request for sending code
        let fetchConfig = {
            method: "POST",
            body: JSON.stringify({
                code,
                email: emailHolder
            })
        }

        try {

            //send code
            const res = await apiFetch('/api/confirm-code', onUnAuthorized, fetchConfig);

            //error on network error
            if(!res?.ok) {
                throw new Error('failed to confirm your code! check your conectivity');
            }

            const data = await res.json();

            //handle request success
            if(data.ok === true) {
                
                setCodeSent(true);
                toast.success('confirmation succeed! now enter your new password');
            } else {
                //send backend error message
                throw new Error(data.message);    
            }
        } catch(err) {
            toast.error(err.message);
        }
        
        setCode("");
        setSpinner(false);
    }

    //handle send new password request
    const sendNewPassword = async e => {
        
        //throttle furthure requests
        e.preventDefault();
        setSpinner(true)

        //config reset password fetch request
        let fetchConfig = {
            method: "POST",
            body: JSON.stringify({
                password,
                confirmPassword,
                email: emailHolder
            })
        }

        try {
            
            //send new password
            const res = await apiFetch('/api/new-password', onUnAuthorized, fetchConfig);

            //send network error message
            if(!res?.ok) {
                throw new Error('failed to confirm your code! check your conectivity');
            }

            //prepare response
            const data = await res.json();

            //check response
            if(data.ok === true) {
                
                //show message
                toast.success(data.message);
                
                //empty holder states when request process finished
                setEmail('');
                setEmailHolder('');
                setEmailSent(false)
                setCodeSent(false);
            } else {
                //show error
                toast.error(data.message);
            }

        } catch(err) {
            //handle error
            toast.error(err.message);
        }

        //empty password fields always
        setPassword('');
        setConfirmPassword('');
        setSpinner(false);
    }

    return (
        <GuestOnly>
            <div style={{border: "1px solid rgba(0, 0, 0, 0.2)", padding: "20px", borderRadius: "8px", width: '30%', margin: "100px auto"}} className="container">
                <h1 className="register text-center pt-4">reset your password</h1>
                <form style={{display: "flex", flexDirection: "column", rowGap: "20px"}} onSubmit={(!emailSent) ? sendEmail : (emailSent && !codeSent) ? sendCode : (emailSent && codeSent) && sendNewPassword}>

                    {!emailSent && <label className={styles.label} htmlFor="email">
                        <span className={styles.span}>please enter your email</span>
                        <input value={email} onChange={e => setEmail(e.target.value)} className={styles.input} type="email" name="email" id="email" placeholder="enter your email" />
                    </label>}

                    {emailSent && !codeSent && <label className={styles.label} htmlFor="code">
                        <span className={styles.span}>please enter sent code</span>
                        <input value={code} onChange={e => setCode(e.target.value)} className={styles.input} type="text" name="code" id="code" placeholder="enter sent code" />
                    </label>}

                    {emailSent && codeSent && (
                        <>
                            <label className={styles.label} htmlFor="password">
                                <span className={styles.span}>please enter your new password</span>
                                <input value={password} onChange={e => setPassword(e.target.value)} className={styles.input} type="password" name="password" id="password" placeholder="enter new password" />
                            </label>
                            <label className={styles.label} htmlFor="confirmPassword">
                                <span className={styles.span}>please enter sent code</span>
                                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={styles.input} type="password" name="confirmPassword" id="confirmPassword" placeholder="reenter new password" />
                            </label>
                        </>
                    )
                    }

                    <button disabled={spinner || (!emailSent && !email) || (emailSent && !codeSent && !code) || (emailSent && codeSent && (!password || !confirmPassword)) } type="submit" className="btn btn-block btn-primary p-2">
                        {spinner ? <SyncOutlined spin /> : "submit"}
                    </button>
                </form>
            </div>
        </GuestOnly>
    )
}

export default forgotPassword