import { Schema, model } from "mongoose";

const CriteriaLocationSchema = new Schema({
    filtername: {
        type: String,
    },

    Platformuser: {
        type: String,
        enum: ["admin", "user"],
        require: true
    },
    userid: {
        type: Schema.Types.ObjectId,
        refPath: "Platformuser",
    },
    geometry:{}
},{timestamps:true})

const CriteriaLocationModel = model("CriteriaLocation", CriteriaLocationSchema);

export default CriteriaLocationModel;