import mongoose, { Schema } from "mongoose"

const proposalSchema = new Schema({
    provider: {type: Schema.Types.ObjectId, ref: "User", required: true, index: true},
    request: {type: Schema.Types.ObjectId, ref: "Request", required: true, index: true},
    proposalContent: {type: String, required: true},
    price: {type: Number, required: true, min: 0, index: true},
    status: {type: String, enum: ['accepted', 'rejected', 'pending', 'withdrawn'], default: "pending", index: true}
})


/********************************** these filters searched by users **********************************/
//proposals which their request is ${request} and their price is ${price}
proposalSchema.index({request: 1, price: 1, status: 1, createdAt: -1})


/********************************** these filters searched by providers **********************************/
// proposals which their provider is ${provider} and their status is ${status}
proposalSchema.index({provider: 1, status: 1, price: 1, createdAt: -1}) 

//just one proposal from a provider on a request
proposalSchema.index({provider: 1, request: 1}, {unique: true})