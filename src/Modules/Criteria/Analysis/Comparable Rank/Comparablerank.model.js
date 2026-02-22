import { Schema, model } from "mongoose";

const comparableRankSchema = new Schema({
    filtername: {
        type: String,
    },
    filterpagepath: {
        type: String,
        default: "/criteria/analysis/CR"
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
    weight1: {
        yearbuilt: { type: Number, default: 0 },
        gla: { type: Number, default: 0 },
        acreage: { type: Number, default: 0 },
        beds: { type: Number, default: 0 },
        baths: { type: Number, default: 0 },
        distance: { type: Number, default: 0 }
    },
    weight2: {
        garages: { type: Number, default: 0 },
        carports: { type: Number, default: 0 },
        privatepool: { type: Number, default: 0 },
        solddate: { type: Number, default: 0 },
        levels: { type: Number, default: 0 },
        homestyle: { type: Number, default: 0 },
    }

},{timestamps:true})

const comparableRankmodel = model("comparableRank", comparableRankSchema);

export default comparableRankmodel;