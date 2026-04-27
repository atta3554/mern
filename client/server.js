//optional custom server

import next from "next"
import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"

const dev = process.env.NODE_ENV !== "production";
const app = next({dev})
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express()
    
    if(dev) {
        server.use('/api', createProxyMiddleware({
            target: "http://127.0.0.1:8000/api",
            changeOrigin: true
        }))
    }

    server.use('/uploads', createProxyMiddleware({
        target: "http://127.0.0.1:8000/uploads",
        changeOrigin: true
    }))

    server.use((req, res)=> {
        return handle(req, res)
    })

    server.listen(3000, err=> {
        if(err) throw err;
        console.log('server ready');
        
    })
}).catch(err=> console.log(err))