import express from "express"
import { sendCodeToEmail } from '../controllers/mailer.js'
const router = express.Router()

router.post('/send-email', sendCodeToEmail);

export default router