import express from "express"
import cors from "cors"
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url"
import { readdirSync } from "fs"
import cookieParser from "cookie-parser";
import csurf from "csurf";
import path from "path";
import mongoose from "mongoose";
import { log } from "console";

dotenv.config();

// run app
const app = express();

//csrf protection
const csrfProtection = csurf({cookie: true})

// db connection
mongoose.connect(process.env.MONGODB).then(log('db connected')).catch(err=> log("db connection errored: " , err))

// config middlewares
app.use( cors({ origin: "http://127.0.0.1:3000" }) );
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(cookieParser());
app.use(csrfProtection);
app.use(morgan("dev"));
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR)))

const __filePath = fileURLToPath(import.meta.url);
const __dirPath = path.dirname(__filePath);
const Routes = readdirSync(path.join(__dirPath, 'routes'));

for(const file of Routes) {
    const route = await import(`./routes/${file}`) 
    app.use('/api', route.default)
}

//Run App
const port = process.env.PORT || 8000
app.listen(port, () => console.log('server is running on port ' + port));