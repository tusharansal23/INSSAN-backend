import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    title: {
        type: String,
        enum: ["GALLERY", "BODY"],
        default:"GALLERY"
    },
    description:{
        type: String
    },
    date: {
        type: Date,
        default: new Date()
    },
    imageUrl:{
        type: String,
        required: true
    }
}, {timestamps: true});

const Media = mongoose.model("Media", mediaSchema);
export default Media;