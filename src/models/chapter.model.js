import mongoose from "mongoose";
const chapterSchema = new mongoose.Schema({
    chapter: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
        },
        mobile: {
            type: Number,
        },
        gstn: {
            type: String,
        },
        address: {
            area: {
                type: String,
            },
            city : {
                type: String
            },
            state : {
                type: String
            },
            pincode: {
                type: Number
            }
        }
    },
    chairman: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
        },
        mobile: {
            type: Number,
        },
        address: {
            area: {
                type: String,
            },
            city : {
                type: String
            },
            state : {
                type: String
            },
            pincode: {
                type: Number
            }
        }
    },
    secretary: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
        },
        mobile: {
            type: Number,
        },
        address: {
            area: {
                type: String,
            },
            city : {
                type: String
            },
            state : {
                type: String
            },
            pincode: {
                type: Number
            }
        }
    }
}, {timestamps: true});

const Chapter = mongoose.model("Chapter", chapterSchema);
export default Chapter;