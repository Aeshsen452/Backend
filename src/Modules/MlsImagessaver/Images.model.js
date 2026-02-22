import { Schema,model } from "mongoose";


const mlsimagesSchema = new Schema({
    mlslsitingid :{
        type: Schema.Types.ObjectId,
        ref:"listingMls"
    },
    imagepath:{
        type:String
    }
},{timestamps:true});


const mlsimagesmodel = model("mlsimages",mlsimagesSchema);
export default mlsimagesmodel