import express from 'express'
import { createReview, getReview, updateReview } from '../controllers/reviewController.js'


const reviewRouter = express.Router()

reviewRouter.post("/",createReview)
reviewRouter.get("/get-review",getReview)
reviewRouter.put("/:reviewId",updateReview)
export default reviewRouter