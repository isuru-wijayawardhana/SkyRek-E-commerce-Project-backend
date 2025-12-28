import express from 'express'
import { createReview, getPublicReviews, getReview, updateReview } from '../controllers/reviewController.js'


const reviewRouter = express.Router()

reviewRouter.post("/",createReview)
reviewRouter.get("/get-review",getReview)
reviewRouter.put("/:reviewId",updateReview)
reviewRouter.get("/get-public-review",getPublicReviews)
export default reviewRouter