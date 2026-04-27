import User from "../models/user.js"
import Country from "../models/country.js"
import Province from "../models/province.js"
import City from "../models/city.js"
import { hashPassword, comparePasswords } from "../utils/auth.js"
import jwt from "jsonwebtoken"
import { expressjwt } from "express-jwt"
import locationSchema from "../models/schemas/location.js"
import mongoose from "mongoose"

export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        for(const [field, value] of Object.entries({name, email, password})) {
            if(typeof field !== "string" || !value.trim()) return res.status(400).json(`${field} is required`);
        }

        if(password.length < 6) return res.status(400).json(`password must be more than 6 character`);

        let userExists = await User.findOne({email}).exec();
        if(userExists) return res.status(400).json(`email already exists`);

        let hashedPassword = await hashPassword(password);

        const user = await new User({name, email, password: hashedPassword}).save();
        return res.json({ok: true});

    } catch (err) {
        console.log(err);
        return res.status(500).send({ok: false, message: 'an error occured'});
    }
    
}

export const login = async (req, res) => {
    const errMsg = "invalid credentials";
    try {
        let {email, password, remember} = req.body;

        const user = await User.findOne({email}).exec();
        
        if(!user) {
            return res.status(400).json(errMsg);
        }
        
        
        let storedPassword = user.get('password');
        let correctPassword = await comparePasswords(password, storedPassword);
        
        if(correctPassword != true) {
            return res.status(400).json(errMsg);
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        user.password = undefined

        let tokenOptions = {
            httpOnly: true,
        }

        if(remember) {
            tokenOptions.maxAge = 7 * 24 * 60 * 60 * 1000
        }

        res.cookie("token", token, tokenOptions);

        return res.json({ok: true, user});

    } catch(err) {
        console.log(err);
        return res.status(400).json({ok: true, message: "an error occured"});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ok: true, message: "you have logged out successfully"});
    } catch(err) {
        console.log(err);
        return res.status(400).json({ok: false, message: "an error occured"} );
    }
}

export const csrfToken = async(req, res) => {
    res.json({csrfToken: req.csrfToken()});
}

export const requireSigning = expressjwt({ 
    getToken: (req, res) =>  req.cookies.token,
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"]
});

export const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.auth?._id).select('-password').exec();
        return res.json({ok: true, user});
    } catch(err) {
        console.log(err);
        res.status(500).json({ok: false, message: "DB error"});
    }
}

export const confirmCode = async (req, res) => {
    
    const errorResponse = "invalid credentials";

    try {
        
        const { code, email } = req.body

        if(!code || !email) {
            return res.status(400).json({ok: false, message: errorResponse});
        }

        const user = await User.findOne({email}).exec();

        if(!user) {
            return res.status(400).json({ok: false, message: errorResponse});
        }

        const savedCode = user.passwordResetCode;
        
        if(comparePasswords(code, savedCode)) {
            return res.status(200).json({ok: true, message: 'confirmation succeed'});
        } else {
            throw new Error(errorResponse);
        }

    } catch(err) {
        console.log(err.message)
        return res.status(500).json({ok: false, message: "something went wrong. try again"});
    }
}

export const setNewPassword = async (req, res) => {
    
    const errorResponse = "failed to set new password"

    try {
        const {email, password, confirmPassword} = req.body
        
        if(!email || !password || !confirmPassword) {
            return res.status(400).json({ok: false, message: errorResponse});
        }

        if(password !== confirmPassword) {
            return res.status(400).json({ok: false, message: 'passwords not match'});
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.findOneAndUpdate({email}, {passwordResetCode: '', password: hashedPassword}).exec();

        if(!user) {
            return res.status(400).json({ok: false, message: errorResponse});
        }

        return res.status(200).json({ok: true, message: "your new password has been set successfully"});

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ok: false, message: 'something failed! please try again'});
    }
}

export const editProfile = async (req, res) => {
    try {
        const {_id, name, email, password, confirmPassword, phone, userCountry, userProvince, userCity }= req.body
        
        if(!mongoose.isValidObjectId(_id) || (userCountry && !mongoose.isValidObjectId(userCountry)) || (userProvince && !mongoose.isValidObjectId(userProvince)) || (userCity && !mongoose.isValidObjectId(userCity))) {
            return res.status(400).json({ok: false, message: "invalid data"});
        }

        const user = await User.findOne({_id}).exec();

        if(!user) {
            return res.status(400).json({ok: false, message: "user not found"});
        }

        let hashedPassword = '';

        if(password && confirmPassword) {
            
            if(password !== confirmPassword) {
                return res.status(400).json({ok: false, message: "passwords not match"});
            }

            hashedPassword = await hashPassword(password);
        } else if((password && !confirmPassword) || (!password && confirmPassword)) {
            return res.status(400).json({ok: false, message: "passwords and it's confirmation should be present both"});
        }

        //user country and province and city are tied together, all of them or none of them should exists
        if((userCountry || userProvince || userCity) && (!userCountry || !userProvince || !userCity)) {
            return res.status(400).json({ok: false, message: "country and province and city all should exists or leave all empty"});
        }

        if(userCountry && userProvince && userCity) {
            
            if(!user.requesterProfile) {
                user.requesterProfile = {};
            }

            const city = await City.findOne({_id: userCity, province: userProvince}).exec();
            if(!city) return res.status(400).json({ok: false, message: "city not found"});

            const province = await Province.findOne({_id: userProvince, country: userCountry}).exec();
            if(!province) return res.status(400).json({ok: false, message: "province not found"});

            const country = await Country.findOne({_id: userCountry}).exec();
            if(!country) return res.status(400).json({ok: false, message: "country not found"});

            user.requesterProfile.location = {country: userCountry, province: userProvince, city: userCity}
        }

        for(const [key, value] of Object.entries({name, email, phoneNumber: phone, password: hashedPassword})) {
            if(value) {
                user[key] = value;
            }
        }
        
        await user.save();

        return res.status(200).json({ok: true, message: "your datas successfully updated", user});
    } catch(err) {
        console.log(err.message);
        return res.status(500).json({ok: false, message: "something went wrong! please try again later"});
    }    
}