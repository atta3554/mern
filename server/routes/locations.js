import { getProvinces, getCountries, getCities } from "../controllers/locations.js"
import express from "express"
const router = express.Router();

router.get('/get-countries', getCountries);
router.post('/get-provinces', getProvinces);
router.post('/get-cities', getCities);

export default router