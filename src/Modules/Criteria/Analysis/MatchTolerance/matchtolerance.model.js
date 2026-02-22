import { Schema, model } from "mongoose";

const matchtoleranceSchema = new Schema({
    filtername: {
        type: String,
    },
    filterpagepath: {
        type: String,
        default: "/criteria/analysis"
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
    milesaway: {
        rangebar: {
            type: Number,
            default: 0
        },
        daysback: {
            type: Number,
            default: 0
        },
        sold: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: false
        },
        offmarket: {
            type: Boolean,
            default: false
        },
        pending: {
            type: Boolean,
            default: false
        }
    },
    any: {
        yearbuilt: {
            enabled: { type: Boolean, default: false },
            points: { type: Number, default: 0 }
        },
        gla: {
            enabled: { type: Boolean, default: false },
            points: { type: Number, default: 0 }
        },
        acreage: {
            enabled: { type: Boolean, default: false },
            points: { type: Number, default: 0 }
        },
        beds: {
            enabled: { type: Boolean, default: false },
            points: { type: Number, default: 0 }
        },
        baths: {
            enabled: { type: Boolean, default: false },
            points: { type: Number, default: 0 }
        },
    },
    privatepools: {
        type: String,
    },
    garages: {
        min: { type: Number,default:0 },
        max: { type: Number,default:0 }
    },
    carports: {
        min: { type: Number,default:0 },
        max: { type: Number,default:0 }
    },
    publickeywords: []
},{timestamps:true})

const matchtolerancemodel = model("matchtolerance",matchtoleranceSchema);

export default matchtolerancemodel;