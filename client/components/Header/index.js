import { Menu } from "antd"
import { HomeOutlined, UserAddOutlined, LoginOutlined, LogoutOutlined, CoffeeOutlined, QuestionCircleOutlined, PlusCircleOutlined, FormOutlined } from "@ant-design/icons"
import Link from "next/link"
import { useRouter } from "next/router"
import { Context } from "@/context"
import { useContext } from "react"
import { toast } from "react-toastify"
import styles from "./header.module.css"
import { apiFetch } from "@/lib/api"

const Header = () => {

    //accessing global context state
    const {state: {user, authReady} , dispatch, onUnAuthorized} = useContext(Context)
    
    //prepare router for redirect
    const router = useRouter()

    if(!authReady) {
        return null;
    }

    //configure fetch options
    let fetchConfig = {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        }
    }

    //main logout logic
    const logout = async () => {
        try {
            //send request and parse response
            let res = await apiFetch('/api/logout', fetchConfig);
            let data = await res.json();

            //check network response
            if(!res.ok) {
                throw new Error('network error');
            }

            //check server response
            if(data.ok) {
                
                //update global context
                dispatch({type: "LOGOUT"});

                //remove user data from local storage
                localStorage.removeItem("user");

                //show logout message
                toast.info('you have logged out successfully');

                //redirect to home
                router.push('/login');
            }

            else {
                throw new Error(data.message);
            }
            
        } catch (err) {
            console.log(err);
            toast.error('ann error occured');
        }
    }

    //main menu items
    const mainMenuItems = [
        {
            label: <Link href="/" >Home</Link>,
            key: "/",
            icon: <HomeOutlined />
        },
        {
            label: <Link href="/requests" >Requests</Link>,
            key: "/requests",
            icon: <QuestionCircleOutlined />
        },
        user && {
            label: <Link href="/dashboard/submit-request" >submit request</Link>,
            key: "/dashboard/submit-request",
            icon: <PlusCircleOutlined />
        }
    ]

    //auth menu items
    const authMenuItems = [
        !user && {
            label: <Link href="/register" >register</Link>,
            key: "/register",
            icon: <UserAddOutlined />
        },
        !user && {
            label: <Link href="/login" >login</Link>,
            key: "/login",
            icon: <LoginOutlined />
        },
        user && {
            label: <span>{user.name}</span>,
            key: "sub1",
            icon: <LogoutOutlined />,
            children: [
                {
                    label: <span>logout</span>,
                    key: 'logout',
                    icon: <LogoutOutlined />
                },
                {
                    label: <Link href="/dashboard">Dashboard</Link>,
                    key: '/dashboard',
                    icon: <CoffeeOutlined />,
                },
                (user?.role.includes("admin")) && {
                    label: <Link href="/admin">admin area</Link>,
                    key: '/admin',
                    icon: <FormOutlined />
                },
            ]
        }
    ].filter(Boolean);

    return (
        <header className="d-flex justify-content-between p-2">
            <Menu className={styles.mainMenu} selectedKeys={[router.pathname]} mode="horizontal" items={mainMenuItems}></Menu>
            <Menu className={styles.authMenu} selectedKeys={[router.pathname]} onClick={({ key }) => key === 'logout' && logout()} mode="horizontal" items={authMenuItems}></Menu>
        </header>
    )
}

export default Header;