import Review from "../models/review.js"
import { isAdmin } from "./userController.js"

export async function createReview(req,res) {
    try {
        if(req.user == null){
            res.status(401).json({ message: "Please login to Write Review"})
            return
        }
        const latestRevId = await Review.findOne().sort({ _id: -1 })
        let id = "Rev00010"

        if(latestRevId){
            const lastRevIdINString   =   latestRevId.reviewId
            const lastRevIdWithoutPrefix = lastRevIdINString.replace("Rev","")
            const lastRevIdINInteger  = parseInt(lastRevIdWithoutPrefix)
            const newRevIdInInteger = lastRevIdINInteger + 1
            const newRevIdWithoutPrefix = newRevIdInInteger.toString().padStart(5,'0')
            id = "Rev"+newRevIdWithoutPrefix
        }
        const review = new Review ({
            reviewId: id,
            email: req.user.email,
            name: req.user.firstName +" "+req.user.lastName,
            msg: req.body.msg,
            stars: req.body.stars
        })

        const response = await review.save()
        res.json({
            message : "Review add successfully",
            product : response
        })
    } catch (error) {
        console.log("Error add review : ",error)
        return res.status(500).json({message: "Failed to add review"})
    }
}

export async function getReview(req,res) {
    try {
        if (!isAdmin(req)){
                return res.status(403).json({ message: "Access denied. Admins only"})
            }else{
                const review = await Review.find()
                return res.json(review)
            }
    } catch (error) {
        console.error("Error frching reviews:",error)
        return res.status(500).json({ message: "Failed to fetch reviews" })
    
    }
}
export async function updateReview(req,res) {
    try {
        if(isAdmin(req)){
            const reviewId = req.params.reviewId
            const isShow = req.body.isShow

            await Review.findOneAndUpdate(
                {reviewId:reviewId},
                {isShow:isShow},
                {new:true}
            )
            res.json({message: "Review Update successfully"})
            
        }else{
            return res.status(403).json({ message: "Access denied. Admins only"})
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed update review" })
        
    }
}