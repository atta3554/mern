import AdminOnly from "@/components/wrappers/admins/AdminOnly.js";
import AdminRoutes from "@/components/wrappers/admins/AdminRoutes.js";

export default function () {
    return (
        <AdminOnly>
            <AdminRoutes>
                <h1>wellcome to requests list</h1>
            </AdminRoutes>
        </AdminOnly>
    )
}