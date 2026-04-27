import mongoose from "mongoose"
import path from "path"
import User from "../models/user.js"
import Request from "../models/request.js"
import Category from "../models/category.js"
import Country from "../models/country.js"
import Province from "../models/province.js"
import City from "../models/city.js"
import { processRequestImages } from "../services/upload.service.js"
import { removeFiles, removeFile, removeDirIfEmpty } from "../utils/fsHelpers.js"

export const getCats = async (req, res) => {
    
    const categories = await Category.find().exec()

    if(categories.length === 0) {
        return res.status(500).json({ok: true, message: 'no categories found'});
    }
    
    return res.status(200).json({ok: true, message: categories});
}

export const createRequest = async (req, res) => {

    const {savedFilesPath, imageDocs} = await processRequestImages({files: req.files || [], requestId: req.requestId});

    try {
        const {_id, requestTitle: title, requestDesc: description, userLocationSource: locationSource, userCountry, userProvince, userCity, category} = req.body

        if(!mongoose.isValidObjectId(_id) || !mongoose.isValidObjectId(userCountry) || !mongoose.isValidObjectId(userProvince) || !mongoose.isValidObjectId(userCity) || !mongoose.isValidObjectId(category)) {
            return res.status(400).json({ok: false, message: "invalid location"});
        }

        const currentUser = await User.findOne({_id}).exec();
        
        if(!currentUser) {
            return res.status(400).json({ok: false, message: "user not found"});
        }

        if(!currentUser.requesterProfile?.location) {
            return res.status(400).json({ok: false, message: "submit your location first"});
        }

        let location = null  
        const { country, province, city } = currentUser.requesterProfile.location

        if(locationSource === 'default') {
            if(!country.equals(userCountry) || !province.equals(userProvince) || !city.equals(userCity)) {
                return res.status(400).json({ok: false, message: "location mismatch"});
            }
            location = currentUser.requesterProfile.location
        } else if(locationSource === 'custom') {
            location = {country: userCountry, province: userProvince, city: userCity}
        } else {
            return res.status(400).json({ok: false, message: "invalid location"});
        }

        const userCategory = await Category.findOne({_id: category}).exec();

        if(!userCategory) {
            return res.status(400).json({ok: false, message: "invalid category"});
        }

        const request = await new Request({requester: currentUser._id, title, description, location, locationSource, requestImages: imageDocs, adminStatus: "pending", status: "open", category, categoryType: userCategory.type, categoryAncestors: userCategory.ancestors, categorySlugPath: userCategory.slugPath}).save()

        return res.status(200).json({ok: true, message: request._id});

    } catch(err) {
        console.log(err)
        await removeFiles(savedFilesPath)
        return res.status(500).json({ok: false, message: "masd"});
    }
}

export const getUserRequests = async (req, res) => {
    
    try {
        const {_id} = req.body
    
        if(!mongoose.isValidObjectId(_id)) {
            return res.status(400).json({ok: false, message: "invalid user"});
        }

        const requests = await Request.find({requester: _id}).sort({createdAt: -1})

        if(!requests) {
            return res.status(400).json({ok: false, message: "an error occured"});
        }

        if(requests.length === 0) {
            return res.status(200).json({ok: true, message: "you have no request submited yet"});
        }

        return res.status(200).json({ok: true, message: requests});

    } catch (err){
        console.log(err);
        return res.status(500).json({ok: false, message: "something went wrong! please try again"});
    }
}

export const deleteReuqest = async (req, res) => {
    try {
        const {userId, _id} = req.body
    
        if(!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(_id)) {
            return res.status(400).json({ok: false, message: "invalid credentials"})
        }

        const request = await Request.findOne({_id});

        if(!request) {
            return res.status(500).json({ok: false, message: "something went wrong! please try again"})
        }

        if(!request.requester.equals(userId)) {
            return res.status(400).json({ok: false, message: "request not submited by you"});
        }

        await Promise.all(request.requestImages.map(img=> removeFile(img.url)));
        removeDirIfEmpty(path.dirname(request.requestImages[0]))

        await Request.deleteOne({_id}).exec();

        return res.status(200).json({ok: true, message: 'request deleted successfully!'});

    } catch(err) {
        console.log(err)
        return res.status(500).json({ok: false, message: "something went wrong! please try again"})
    }
}

export const getReuqest = async (req, res) => {
    try {
        const { id } = req.params

        if(!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ok: false, message: "request not found"});
        }

        const currentRequest = await Request.findOne({_id: id}).populate("location.country", "name")
        .populate("location.province", "name").populate("location.city", "name").exec()

        return res.status(200).json({ok: true, message: currentRequest})

    } catch (err) {
        console.log(err)
        return res.status(500).json({ok: true, message: 'something failed!'});
    }
}

export const getAllRequests = async (req, res) => {
    
}