import { Schema, model } from "mongoose";

const compSchema = new Schema({
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
    CompResults:
    {
        type: Schema.Types.ObjectId,
        ref: "listingMls",
        require: true
    }

}, { timestamps: true });


const compSearchmodel = model("compSearch", compSchema);

export default compSearchmodel;


