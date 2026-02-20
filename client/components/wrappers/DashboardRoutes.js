import AuthOnly from "./AuthOnly";
import Link from "next/link";
import { Menu } from "antd"
import { CoffeeOutlined, DollarOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { Context } from "@/context";
import { useRouter } from "next/router";

const DashboardRoutes = ({children}) => {

    const {state: {user}} = useContext(Context);

    const {pathname} = useRouter();
    console.log(pathname);

    const dashboardMenu = [
        {
            label: <Link href="/dashboard">Dashboard</Link>,
            key: '/dashboard',
            icon: <CoffeeOutlined />
        },
        {
            label: <Link href="/dashboard/submit-request">submit Request</Link>,
            key: '/dashboard/submit-request',
            icon: <PlusCircleOutlined />
        },
        (user?.role[0] === "Subscriber" || user?.role[0] === "Requester") && {
            label: <Link href="/dashboard/become-provider">become provider</Link>,
            key: '/dashboard/become-provider',
            icon: <DollarOutlined />
        },
    ].filter(Boolean);

    return (
        <AuthOnly>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 bg-primary py-2 d-flex justify-content-center rounded-end">
                        <Menu items={dashboardMenu} selectedKeys={pathname} classNames={{root: "bg-primary", item: "d-flex align-items-center py-4 px-1 fw-semibold text-white fs-4", itemIcon: "fs-4"}}  />
                    </div>
                    <div className="col-md-10">{children}</div>
                </div>
            </div>
        </AuthOnly>
    )
}

export default DashboardRoutes