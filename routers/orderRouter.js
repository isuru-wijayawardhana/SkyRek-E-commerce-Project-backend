import express from 'express'
import { createOrder, getOrders, getUserOrders, updateOrder } from '../controllers/orderController.js'

const orderRouter = express.Router()
orderRouter.post("/",createOrder)
orderRouter.get("/:page/:limit",getOrders)
orderRouter.put("/:orderId",updateOrder)
orderRouter.get("/get-user-orders",getUserOrders)
export default orderRouter
