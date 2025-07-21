import Product from "../models/product.js";

export async function createProduct(req,res) {
    
 
    const product = new Product(req.body)

    try{
        const response = await product.save()
        
        res.json({
            message : "Product create successfully",
            product : response
        })
    }catch(error){
        console.log("Error create Product : ",error)
        return res.status(500),({message: "Failed to create product"})
    }


}