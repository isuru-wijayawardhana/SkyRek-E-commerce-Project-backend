import Order from "../models/order.js"
import Product from "../models/product.js"

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
    if(req.user == null){
        res.status(401).json({ message: "Please login to view order"})
        return
    }

    try{
        if(req.user.role == "admin"){
            const orders = await Order.find().sort({ date: -1})
            return res.json(orders)
        }else{
            const orders = await Order.find({ email: req.user.email }).sort({ date: -1})
            return res.json(orders)
        }
    }catch (error){
        console.error("Error frching order:",error)
        res.status(500).json({ message: "Failed to fetch order"})
    }
}