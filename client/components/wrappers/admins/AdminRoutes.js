import Link from "next/link";
import { Menu } from "antd"
import { CoffeeOutlined, DollarOutlined, PlusCircleOutlined, EditFilled, ExclamationCircleOutlined, FormOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

export default function AdminRoutes({children}) {

    const { pathname } = useRouter()
    
    const adminMenus = [
        {
            label: <Link href="/admin/users">users</Link>,
            key: '/admin/users',
            icon: <CoffeeOutlined />
        },
        {
            label: <Link href="/admin/requests">requests</Link>,
            key: '/admin/requests',
            icon: <EditFilled />
        },
        {
            label: <Link href="/admin/locations">locations</Link>,
            key: '/admin/locations',
            icon: <PlusCircleOutlined />
        },
        {
            label: <Link href="/admin/proposals">proposals</Link>,
            key: '/admin/proposals',
            icon: <ExclamationCircleOutlined />
        },
        {
            label: <Link href="/admin/provider-applications">provider-applications</Link>,
            key: '/admin/provider-applications',
            icon: <DollarOutlined />
        },
    ].filter(Boolean);

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 bg-primary py-4 d-flex flex-column align-items-center rounded-end">
                        <Menu items={adminMenus} selectedKeys={pathname} classNames={{root: "bg-primary mw-100", item: "d-flex align-items-center py-4 px-1 fw-semibold text-white fs-5", itemIcon: "fs-5"}}  />
                    </div>
                    <div className="col-md-10">{children}</div>
                </div>
            </div>
        )
}