import Order from "../models/order.js"
import Product from "../models/product.js"
import { isAdmin } from "./userController.js";

export async function createOrder(req,res) {
    try {
    if(req.user == null){
        res.status(401).json({ message: "Please login to create order"})
        return
    }
    
    const latestOrder = await Order.find().sort({ date : -1 }).limit(1)

    let orderId = "CBC00202"

    if(latestOrder.length>0){
        const lastOrderIdINString   =   latestOrder[0].orderId
        const lastOrderIdWithoutPrefix = lastOrderIdINString.replace("CBC","")
        const lastOrderIdINInteger  = parseInt(lastOrderIdWithoutPrefix)
        const newOrderIdInInteger = lastOrderIdINInteger + 1
        const newOrderIdWithoutPrefix = newOrderIdInInteger.toString().padStart(5,'0')
        orderId = "CBC"+newOrderIdWithoutPrefix
    }

    const items = []
    let total = 0

    if(req.body.items !== null && Array.isArray(req.body.items)){
        for(let i=0;i<req.body.items.length;i++){
            let item = req.body.items[i]

            let product = await Product.findOne({
                productId : item.productId
            })
            if(product == null){
                res.status(400).json({ message:"Invalid product ID" + item.productId})
                return
            }
            items[i] = {
                productId : product.productId,
                name: product.name,
                image : product.images[0],
                price : product.price,
                qty : item.qty,
            }
            total += product.price * item.qty
        }
    }else{
        res.status(400).json({ message: "Invalid items format"})
    }

    const order = new Order({
        orderId : orderId,
        email : req.user.email,
        name : req.user.firstName + " " + req.user.lastName,
        address : req.body.address,
        phone : req.body.phone,
        items : items,
        total : total
    })

    const result = await order.save()

    res.json({
        message: "order create successfully",
        order: result,
    })
}catch(error) {
    console.error("Error creating order:",error)
    res.status(500).json({ message: "Failed to create order" })
}
}

export async function getOrders(req,res) {

    const page = parseInt(req.params.page) || 1
    const limit = parseInt(req.params.limit) || 10

    if(req.user == null){
        res.status(401).json({ message: "Please login to view order"})
        return
    }

    try{
        if(req.user.role == "admin"){
            const orderCount = await Order.countDocuments()
            const totalPages = Math.ceil(orderCount/limit)

            const orders = await Order.find().skip((page-1)*limit).limit(limit).sort({ date: -1})
            return res.json({
                orders: orders,
                totalPages: totalPages,
            })
        }else{
            const orderCount = await Order.countDocuments({ email:req.user.email })
            const totalPages = Math.ceil(orderCount/limit)

            const orders = await Order.find({ email: req.user.email }).skip((page-1)*limit).limit(limit).sort({ date: -1})
            return res.json({
                orders: orders,
                totalPages: totalPages,
            })
        }
    }catch (error){
        console.error("Error frching order:",error)
        res.status(500).json({ message: "Failed to fetch order"})
    }
}

export function updateOrder(req,res){
    if(isAdmin(req)){
        const orderId = req.params.orderId
        const status = req.body.status
        const notes = req.body.notes

        Order.findOneAndUpdate(
            {orderId:orderId},
            {status:status,notes: notes},
            {new:true}
        ).then(
            (updateOrder=>{  
                if(updateOrder){
                    res.json({
                        message:"Order updated successfully",
                        order:updateOrder,
                    })
                }else{
                    res.status(404).json({message:"Order not found"})
                }
            })
        ).catch(
            (error)=>{
                console.error("Error updating order:",error)
                res.status(500).json({message:"Failed to update order"})
            }
        )
        
    }else{
        res.status(403).json({
			message : "You are not authorized to update orders"
		})
    }
}
export async function getUserOrders(req, res) {
    if(req.user == null){
        res.status(401).json({ message: "Please login to view order"})
        return
    }
    try {
        const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err)
        res.status(500).send(err);
    }
}