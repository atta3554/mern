import { apiFetch } from "./api";
import { toast } from "react-toastify";

export const handleFetch = async (setSpinner, path, fetchConfig, globalFetchFailureMsg, setData) => {
    try {
        setSpinner(true)

        const res = await apiFetch(path, fetchConfig);
        const {ok, message} = await res.json();

        if(!res.ok || !ok || typeof message === "string") {
            toast.error(message)
            setData([]);
        } else {
            setData(message);
        }

        setSpinner(false)
    } catch {
        toast.error(globalFetchFailureMsg);
    }
}

export async function getRequestPageProps(ctx) {
    try {
        const { id } = ctx.params;
        const cookie = ctx.req.headers.cookie

        const [requestsRes, authRes] = await Promise.all([
            fetch(process.env.NEXT_PUBLIC_API_BASE + `/get-request/${id}`, {headers: {cookie}}),
            fetch(process.env.NEXT_PUBLIC_API_BASE + `/current-user`, {headers: {cookie}})
        ]);

        const [requestData, authData] = await Promise.all([
            requestsRes.json(),
            authRes.json()
        ])

        if(!requestsRes.ok || !requestData.ok) {
            if(requestsRes.status === 400) {
                return {
                    notFound: true
                }
            } else return {
                props: {
                    error: "failed to fetch request"
                }
            }
        } else if(!authRes.ok || !authData.ok) {
            if (authRes.status === 401) {
                return {
                    redirect: {
                        destination: "/login",
                        permenanr: false
                    }
                }
            } else if(authRes.status === 403) {
                return {
                    props: {
                        error: "invalid csrf token"
                    }
                }
            } else return {
                props: {
                    error: "failed to fetch request"
                }
            }
        }

        return {
            props: {request: requestData.message, user: authData.user}
        };
        
    } catch (err){
        console.log(err)
        return {
            props: {
                error: "something failed! please try again later"
            }
        };
    }
}