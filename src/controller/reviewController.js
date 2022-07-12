const bookModel = require('../model/bookModel')
const reviewModel = require('../model/reviewModel')
const moment = require('moment')
const validator = require('../validation/validation')

const isValidString = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value !== "string" || value.trim().length === 0) return false //"gdfgyfdghf"
    return true;
}

//***************************************** createReview **********************************************************/


const createReview = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewData = req.body
        const { reviewedBy, reviewedAt, rating, review } = reviewData

        reviewData["bookId"] = bookId

        // if (!/^[0-9a-f]{24}$/.test(bookId)) {
        //     return res.status(400).send({
        //         status: false,
        //         message: `bookId is not valid`
        //     });
        // }

        if(!validator.isValidObjectId(bookId)){
            return res.status(400).send({
                        status: false,
                        message: `bookId is not valid`
                    });
        }


        const checkBookId = await bookModel.findById(bookId)
        if (!checkBookId) {
            return res.status(404).send({
                status: false,
                message: `No Book Found`
            });
        }

        if (Object.keys(reviewData).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body can't be empty"
            })
        }

        if (!reviewedBy) {
            return res.status(400).send({
                status: false,
                message: "reviewedBy is mandatory"
            })
        }

        if (!isValidString(reviewedBy)) {
            return res.status(400).send({
                status: false,
                message: "reviewedBy should be string & can't be empty"
            })
        }

        if (!isNaN(reviewedBy)) {
            return res.status(400).send({
                status: false,
                message: "reviewedBy can't be number"
            })
        }

        if (!reviewedAt) {
            return res.status(400).send({
                status: false,
                message: "releasedAt is mandatory"
            })
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
            return res.status(400).send({
                status: false,
                message: " releasedAt should be look like this: YYYY-MM-DD & doesn't contain empty space "
            })
        }

        let today = new Date();
        let date = today.getFullYear() + '-' + '0' + (today.getMonth() + 1) + '-' + today.getDate();


        if (!(date == reviewedAt)) {
            return res.status(400).send({
                status: false,
                message: " Please enter current date with format : YYYY-MM-DD "
            })
        }


        reviewData.reviewedAt = moment().format("YYYY-MM-DDThh:mm:ss.SSS[Z]")

        if (!rating) {
            return res.status(400).send({
                status: false,
                message: "rating is mandatory"
            })
        }

        if (isNaN(rating)) {
            return res.status(400).send({
                status: false,
                message: " rating should be a number only & should not inside quotes "
            })
        }
// rating type number is handled with below not 
        // if(typeof rating== "string"){
        //     return res.status(400).send({
        //         status: false,
        //         message: " rating should be a number only & should not inside quotes"
        //     })
        // }

        if (!(rating <= 5 && rating >= 1)) {
            return res.status(400).send({
                status: false,
                message: " Please take rating on 1 to 5  "
            })
        }

        if (review) {
            if ((review.length < 4)) {
                return res.status(400).send({
                    status: false,
                    message: "Mininum 4 Character should be there on Reviews "
                })
            }
        }

        const saveReview = await reviewModel.create(reviewData)

        let postReview= await bookModel.findOneAndUpdate({ _id: bookId, isDeleted:false }, { $inc: { reviews: 1 } })
       
        const bookDetails= await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, {$set: {reviewsData:[saveReview]}}, {new: true,upsert: true, strict: false})
   
       
        return res.status(201).send({
            status: true,
            message: "Review successfully Created",
            data: bookDetails
        })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }


}


//***************************************** updateReviewById **********************************************************/



const updateReviewById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const reviewId = req.params.reviewId

        const reviewData = req.body
        const { reviewedBy, rating, review, } = reviewData

        reviewData["bookId"] = bookId

        if(!validator.isValidObjectId(bookId)){
            return res.status(400).send({
                        status: false,
                        message: `bookId is not valid`
                    });
        }

        const checkBookId = await bookModel.findById(bookId)
        if (!checkBookId) {
            return res.status(404).send({
                status: false,
                message: `No Book Found`
            });
        }

        if(!validator.isValidObjectId(reviewId)){
            return res.status(400).send({
                        status: false,
                        message: `reviewId is not valid`
                    });
        }

        const checkReviewId = await reviewModel.findById(reviewId)
        if (!checkReviewId) {
            return res.status(404).send({
                status: false,
                message: `No Review Found`
            });
        }

        if (Object.keys(reviewData).length == 0) {
            return res.status(400).send({
                status: false,
                message: "Body can't be empty"
            })
        }

        let updateQuery = {}

        if (reviewedBy) {

            if (!isValidString(reviewedBy)) {
                return res.status(400).send({
                    status: false,
                    message: "reviewedBy should be string & can't be empty"
                })
            }

            if (!isNaN(reviewedBy)) {
                return res.status(400).send({
                    status: false,
                    message: "reviewedBy can't be number"
                })
            }

            updateQuery["reviewedBy"] = reviewedBy
        }

        if (req.body["reviewer's name"]) {

            if (!isValidString(req.body["reviewer's name"])) {
                return res.status(400).send({
                    status: false,
                    message: "reviewer's name should be string & can't be empty"
                })
            }

            if (!isNaN(req.body["reviewer's name"])) {
                return res.status(400).send({
                    status: false,
                    message: "reviewer's name can't be number"
                })
            }

            updateQuery["reviewedBy"] = req.body["reviewer's name"]
        }


        if (rating) {
            if (isNaN(rating)) {
                return res.status(400).send({
                    status: false,
                    message: " rating should be a number only  "
                })
            }

            if (!(rating <= 5 && rating >= 1)) {
                return res.status(400).send({
                    status: false,
                    message: " Please take review on 1 to 5  "
                })
            }
            updateQuery["rating"] = rating
        }


        if (review) {
            if ((review.length < 4)) {
                return res.status(400).send({
                    status: false,
                    message: "Mininum 4 Character should be there on Reviews "
                })
            }
            updateQuery["review"] = review
        }

        updateQuery["reviewedAt"] = moment().format("YYYY-MM-DDThh:mm:ss.SSS[Z]")

        const newReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },  updateQuery ,{new:true})
        const bookDetails= await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, {$set: {reviewsData:[newReview]}}, {new: true,upsert: true, strict: false})

        res.status(200).send({
            status: true,
            message: "review successfully updated",
            data: bookDetails
        })
    } catch (err) {
        console.log(err.message)
        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}



module.exports.createReview = createReview
module.exports.updateReviewById = updateReviewById