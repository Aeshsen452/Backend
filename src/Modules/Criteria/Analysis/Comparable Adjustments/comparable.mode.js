import { Schema, model } from "mongoose";

const comparableSchema = new Schema({
    filtername: {
        type: String,
    },
    filterpagepath: {
        type: String,
        default: "/criteria/analysis/CA"
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
    adjustment1: {
        yearbuilt: { type: Number, default: 0 },
        gla: { type: Number, default: 0 },
        acres: { type: Number, default: 0 },
        beds: { type: Number, default: 0 },
        Baths: { type: Number, default: 0 },
        fullbath: { type: Number, default: 0 }
    },
     adjustment2: {
        garages: { type: Number, default: 0 },
        carports: { type: Number, default: 0 },
        privatepool: { type: Number, default: 0 }
    }

},{timestamps:true})

const comparableadjustmentmodel = model("comparableAjustment",comparableSchema);

export default comparableadjustmentmodel;