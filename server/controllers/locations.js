import Country from "../models/country.js"
import Province from "../models/province.js"
import City from "../models/city.js"
import mongoose from "mongoose"

export const getCountries = async (req, res) => {
    try {
        const countries = await Country.find().exec()

        if(!countries.length) {
            return res.status(500).json({ok: false, message: "something went wrong"})
        }

        return res.status(200).json({ok: true, message: countries});
    } catch {
        return res.status(500).json({ok: false, message: "something went wrong"})
    }    
}

export const getProvinces = async (req, res) => {
    
    try {
        const { country } = req.body;
        if(!mongoose.isValidObjectId(country)) {
            return res.status(400).json({ok: false, message: "country not found"});
        }
        
        const userCountryProvinces = await Province.find({country}).select("_id name");
        
        if(!userCountryProvinces.length) {
            return res.status(404).json({ok: false, message: "no province found"});
        }

        return res.status(200).json({ok: true, message: userCountryProvinces});

    } catch {
        return res.status(500).json({ok: false, message: "something went wrong"});
    }
    
}

export const getCities = async (req, res) => {
    try {
        const { province } = req.body
        
        if(!mongoose.isValidObjectId(province)) {
            return res.status(400).json({ok: false, message: "province not found"});
        }

        const cities = await City.find({province}).select('_id name');
        
        if(!cities.length) {
            return res.status(404).json({ok: false, message: "no city found"});
        }

        res.status(200).json({ok: true, message: cities});
        
    } catch {
        return res.status(500).json({ok: false, message: "something went wrong! please try again later"});
    }
}