import AdminOnly from "@/components/wrappers/admins/AdminOnly"
import AdminRoutes from "@/components/wrappers/admins/AdminRoutes"

export default function admin() {
    
    return (
        <AdminOnly>
            <AdminRoutes>
                <h1>wellcome to admin area</h1>
            </AdminRoutes>
        </AdminOnly>
    )
}