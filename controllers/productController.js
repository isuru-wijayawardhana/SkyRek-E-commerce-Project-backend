import Product from "../models/product.js";

export async function createProduct(req,res) {
    
    if (req.user == null){
        res.status(403).json({
            message: "Please login to create a product"
        })
        return;
    }
    if (req.user.role != "admin"){
        res.status(403).json({
            message: "You are not authorized to create a product"
        })
        return;
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
        return res.status(500),({message: "Failed to create product"})
    }


}