import { editProfile, register, login, logout, csrfToken, requireSigning, currentUser, confirmCode, setNewPassword } from "../controllers/auth.js"
import express from "express"
const router = express.Router()

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/csrf-token', csrfToken);
router.get('/current-user', requireSigning, currentUser);
router.post('/confirm-code', confirmCode);
router.post('/new-password', setNewPassword);
router.post('/edit-profile', editProfile);

export default router;