import { Schema, model } from "mongoose";

const offerSchema = new Schema({
     filtername: {
        type: String,
    },
    filterpagepath: {
        type: String,
        default: "/offer/makeanoffer/offerdetails"
    },
    Platformuser: {
        type: String,
        enum: ["admin", "user"],
        require: true
    },
    userid: {
        type: Schema.Types.ObjectId,
        refPath: "Platformuser",
        required: true
    },
    ListingId:{
        type:Schema.Types.ObjectId,
        ref:"Analysis",
        required:true
    },

    BuyerName: {
        type: String
    },
    CompanyName: {
        type: String
    },
    CompanyAddress: {
        type: String
    },
    CompanyPhone: {
        type: String
    },
    CompanyEmail: {
        type: String
    },

}, { timestamps: true });


const offermodel = model("offer", offerSchema);

export default offermodel;