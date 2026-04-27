import ProtectedDashboardLayout from "@/components/wrappers/users/ProtectedDashboardLayout";
import { Context } from "@/context";
import { apiFetch } from "@/lib/api";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { trimChars } from "@/lib/strings";
import { SyncOutlined } from "@ant-design/icons";

const myReuqests = () => {

    const {state: {user}} = useContext(Context);
    
    const [userRequests, setUserRequests] = useState([]);
    const [spinner, setSpinner] = useState(false);
    
    useEffect( ()=> {

        if(!user) return

        (async () => {

            const fetchConfig = {
                method: "POST",
                body: JSON.stringify({_id: user._id})
            }

            const res = await apiFetch('/api/my-requests', fetchConfig);
            const {ok, message} = await res.json();

            (!res.ok || !ok) ? toast.error(message) : setUserRequests(message || []);
        })()
    }, [user])

    const handleAdminStatus = (adminStatus) => {
        switch(adminStatus) {
            case "pending" :
                return <p className="text-center bg-info text-white px-4 py-1 rounded mx-auto mb-0">waiting for admins confirmation</p>
            case "approved" : 
                return <p className="text-center bg-success text-white px-4 py-1 rounded mx-auto mb-0">confirmed by admin</p>
            case "rejected" :
                return <p className="text-center bg-danger text-white px-4 py-1 rounded mx-auto mb-0">rejected by admins</p>
        }
    }

    const handleRequestStatus = (reqStatus) => {
        switch(reqStatus) {
            case 'open' : 
                return <p className="fw-bold ms-1 mb-0 text-info">{reqStatus}</p>;
            case 'assigned' : 
                return <p className="fw-bold ms-1 mb-0 text-success">{reqStatus}</p>;
            case 'close' : 
                return <p className="fw-bold ms-1 mb-0 text-danger">{reqStatus}</p>;
        }
    }

    const deleteRequest = async (e, _id) => {
        setSpinner(true);
        const deleteConfig = {
            method: "POST",
            body: JSON.stringify({userId : user._id, _id})
        }

        const res = await apiFetch('/api/delete-request', deleteConfig);
        const {ok, message} = await res.json()

        if(!res.ok || !ok) {
            toast.error(message)
        } else {
            toast.success(message);
            setUserRequests(prev=> prev.filter(req=> req._id !== _id));
        }

        setSpinner(false)
    }

    const editRequest = async (e, _id) => {
        setSpinner(true)
        const editConfig = {
            method: "POST",
            body: JSON.stringify({userId : user._id, _id})
        }

        const res = await apiFetch('/api/edit-request', editConfig);
        const {ok, message} = await res.json()

        if(!res.ok || !ok) {
            toast.error(message)
        } else {
            toast.success('request deleted successfully');
            setUserRequests(message);
        }
        setSpinner(false)
    }
    
    return (
        <ProtectedDashboardLayout>
            <div style={{border: "1px solid rgba(0, 0, 0, 0.2)", padding: "20px", borderRadius: "8px", width: '80%', margin: "100px auto"}} className="container position-relative">
                <h1>requests submited by you</h1>
                {spinner && <div className="position-absolute d-flex justify-content-center align-items-center end-0 start-0 top-0 bottom-0 bg-white opacity-75" ><SyncOutlined spin className="fs-1" /></div>}
                {console.log(userRequests)}
                {typeof userRequests === "object" && userRequests?.length > 0 && userRequests.map(req=> (
                    <div className="d-flex border rounded-4 p-2 mb-2">
                        <div className="w-20 p-1 d-flex justify-content-center align-items-center">
                            <Image className="m-auto" width={200} height={200} src="/images/avatar.webp" alt="" />
                        </div>
                        <div className="w-80 p-2">
                            <div className="d-flex justify-content-between align-items-center my-2">
                                <div className="w-80 d-flex">
                                    <h3 className="mw-40 mb-0"><Link href={`./my-requests/${req._id}`}>{trimChars(req.title)}</Link></h3>
                                    {handleAdminStatus(req.adminStatus)}
                                </div>
                                <div className="w-20 text-center">
                                    <Link className="d-flex flex-column align-items-center" href={`../request-cats/${req.categorySlugPath}`}><span>category: </span><span>{req.categorySlugPath}</span></Link>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
                                <div className="w-80 d-flex column-gap-2 justify-content-between pe-5 align-items-center">
                                    <div className="d-flex">status: {handleRequestStatus(req.status)}</div>
                                    <span>proposals submited on this reuqest: {req.proposalCount}</span>
                                </div>
                                <div className="w-20 d-flex align-items-center justify-content-center column-gap-2">
                                    <div role="button" onClick={e=> deleteRequest(e, req._id)} className="bg-danger rounded px-3 py-2 text-white fw-semibold">delete</div>
                                    <div role="button" onClick={e=> editRequest(e, req._id)} className="bg-info rounded px-3 py-2 text-white fw-semibold">edit</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {typeof userRequests === "string" && <h3 className="mt-5 text-center">{userRequests}</h3>}
                {!userRequests || userRequests.length === 0 && <h2>no request submited yet</h2>}
            </div>
        </ProtectedDashboardLayout>
    )
}

export default myReuqests