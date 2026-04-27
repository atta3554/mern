import AdminOnly from "@/components/wrappers/admins/AdminOnly.js";
import AdminRoutes from "@/components/wrappers/admins/AdminRoutes.js";
import { apiFetch } from "@/lib/api";
import { useEffect } from "react";

export default function () {

    useEffect(() => {
        const res = apiFetch('/get-locations')
    })

    return (
        <AdminOnly>
            <AdminRoutes>
                <h1>wellcome to location manager</h1>
            </AdminRoutes>
        </AdminOnly>
    )
}