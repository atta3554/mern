import mongoose from "mongoose";
import { getCats, createRequest, getUserRequests, deleteReuqest, getReuqest, getAllRequests } from "../controllers/request.js"
import { requestImageUploadMiddleware } from "../services/upload.service.js";
import express from "express"
const router = express.Router();

router.get('/get-cats', getCats);
router.post('/create-request', (req, res, next) => {
    req.requestId = new mongoose.Types.ObjectId();
    next();
}, requestImageUploadMiddleware(), createRequest);
router.post('/my-requests', getUserRequests);
router.post('/delete-request', deleteReuqest);
router.get('/get-requests', getAllRequests);
router.get('/get-request/:id', getReuqest);

export default router