import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    password : {
        type : String,
        require : true
    },
    phone : {
        type : String,
        require : true,
        default : "NOT GIVEN"
    },
    isBlock : {
        type : String,
        default : false
    },
    role : {
        type : String,
        default : "user"
    },
    isEmailVerified : {
        type : String,
        default : false
    },
    image : {
        type : String,
        default : null
    },
    address : {
        type : String,
        default : "NOT GIVEN"
    }
})

const User = mongoose.model("users",userSchema)

export default User;