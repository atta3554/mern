import { Context } from "@/context";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

export default function AdminOnly({children}) {

    const {state: { user, authReady } } = useContext(Context)

    const router = useRouter()

    useEffect(() => {
        if( authReady && !user) {
            router.replace('/');
        } else if (authReady && user && !user.role.includes('admin')) {
            router.replace('/');
        }
    }, [user, authReady, router])

    if(!authReady) return <Spin fullscreen />

    if(!user) return <Spin fullscreen />

    if(!user.role.includes('admin')) return <Spin fullscreen />

    console.log(user)

    return <>{children}</>
}