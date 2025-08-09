import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createProduct(req,res) {
    
    if (!isAdmin(req)){
        return res.status(403).json({ message: "Access denied. Admins only"})
    }    

    const product = new Product(req.body)

    try{
        const response = await product.save()
        
        res.json({
            message : "Product create successfully",
            product : response
        })
    }catch(error){
        console.log("Error create Product : ",error)
        return res.status(500).json({message: "Failed to create product"})
    }


}

export async function getProducts(req,res) {
    try{
        if(isAdmin(req)){
            const products = await Product.find()
            return res.json(products)
        }else{
            const products = await Product.find({ isAvailable: true})
            return res.json(products)
        }
    }catch(error){
        console.error("Error frching products:",error)
        return res.status(500).json({ message: "Failed to fetch product" })
    }
}

export async function deleteProduct(req,res) {
    try{
        if(!isAdmin(req)){
            return res.status(403).json({ message: "Access denied. Admins only"})
        }else{
            const productId = req.params.productId
            await Product.deleteOne({
                productId : productId
            })

            res.json({ message : "Product deleted Successfully"})
        }
    }catch(error){
        console.error("Error delete products:",error)
        return res.status(500).json({ message: "Failed to delete product" })
    }
}

export async function updateProduct(req,res) {
    if(!isAdmin(req)){
            return res.status(403).json({ message: "Access denied. Admins only"})
    }
    const data = req.body
    const productId = req.params.productId
    data.productId = productId


    try{

        await Product.updateOne(
            {
                productId : productId,
            },
            data
        )
        res.json({ message: "product update successfully"})
    }catch(error){
        console.error("Error delete products:",error)
        return res.status(500).json({ message: "Failed to delete product" })
    }
}

export async function getProductInfo(req,res) {
    try{
        const productId = req.params.productId
        const product = await Product.findOne({productId : productId})

        if(product == null){
            res.status(404).json({ message : "Product no found"})
            return
        }

        if(isAdmin(req)){
            res.json(product)
        }else{
            if(product.isAvailable){
                res.json(product)
            }else{
                res.status(404).json({ message : "Product is not available"})
            }
        }

    }catch(error){
        console.error("Error feching products:",error)
        return res.status(500).json({ message: "Failed to feching product" })
    }
}