import { getRequestPageProps } from "@/lib/request"
import DashboardRoutes from "@/components/wrappers/users/DashboardRoutes"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"

export default function singleRequestPage({request, user, error}) {

    const { pathname } = useRouter()

    return (
        <DashboardRoutes user={user} pathname={pathname}>
            <div className="pt-5">
                <h1 className="text-center">{request.title}</h1>
                <div className="d-flex align-items-center justify-content-center mt-5 column-gap-2 px-4 py-2">
                    {request.requestImages?.length > 0 && request.requestImages.map(img => <div key={img._id} className="p-1"><Image className="rounded-4" width={200} height={200} src={`${process.env.NEXT_PUBLIC_BASE_URL}${img.url}`} alt={`${img.alt}`} /></div>)}
                    { (!request.requestImages || !request.requestImages.length) && <Image width={200} height={200} src='/public/images/avatar.png' />}
                </div>
                <div className="d-flex justify-content-between px-4 py-2 mt-2 column-gap-4">
                    <div>category: <Link href={`../requests/${request.categorySlugPath}`}>{request.categorySlugPath}</Link></div>
                    <div>status: {request.status}</div>
                    <div>admin status: {request.adminStatus}</div>
                </div>
                <div className="d-flex px-4 py-2">request submited on : <Link className="mx-2" href={`../requests`}>{request.location.country.name}</Link> / {request.location.province.name} / {request.location.city.name}</div>
                <div className="p-2">{request.description}</div>
            </div>
        </DashboardRoutes>
    )
}

export const getServerSideProps = getRequestPageProps