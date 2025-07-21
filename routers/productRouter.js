import express from 'express'
import { createProduct, deleteProduct, getProducts } from '../controllers/productController.js';


const productRouter = express.Router();
productRouter.post("/",createProduct)
productRouter.get("/",getProducts)
productRouter.delete("/:productId",deleteProduct)
// productRouter.delete("/:productId",(req,res)=>{
//     console.log(req.params.productId)
//     console.log("delete request triggered")
// })

export default productRouter