import mongoose from "mongoose"

const revewSchema = new mongoose.Schema({
    reviewId : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    msg : {
        type : String,
        required : true
    },
    stars : {
        type : Number,
        required : true
    },
    isShow :{
        type : Boolean,
        default : false
    } 
})

const Review = new mongoose.model("review",revewSchema)

export default Review;