import "bootstrap/dist/css/bootstrap.min.css"
import "antd/dist/reset.css"
import "../public/css/styles.css"
import "react-toastify/dist/ReactToastify.css"
import {Provider} from "../context"
import { ToastContainer } from "react-toastify"
import Header from "../components/Header"

function MyApp({Component, pageProps}) {

    return (
        <Provider> 
            <Header />
            <Component {... pageProps} />
            <ToastContainer />
        </Provider>
    )
    
}

export default MyApp