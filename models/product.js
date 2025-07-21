import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    productId : {
        type : String,
        required :true,
        unique : true 
    },
    name : {
        type : String,
        requireed : true 
    },
    altName : {
        type : [String], // This is Array
        default : [] 
    },
    labelledPrice : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    images : {
        type : [String],
        default : ["/default-product.jpg"]
    },
    description : {
        type : String,
        required : true
    },
    stock : {
        type : Number,
        required : true,
        default : 0
    },
    isAvailble : {
        type : Boolean,
        default : true
    },
    category : {
        type : String,
        required : true,
        default : "cosmatics"
    }
})
const Product = mongoose.model("product",productSchema) 
export default Product