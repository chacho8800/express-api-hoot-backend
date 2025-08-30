const express = require("express")
const verifyToken = require("../middleware/verify-token.js")
const Hoot = require("../models/hoot.js")
const router = express.Router()

// RESTful Routes

// Index GET /hoots
router.get("/", verifyToken, async (req, res) => {
    try {
        const hoots = await Hoot.find({})
        .populate("author")
        .sort({createdAt: "desc"})

        res.status(200).json(hoots)
    } catch (error) {
        res.status(500).json({err: error.message})
    }
})

// Create POST /hoots = verifyToken will add the 
// user on to the req (req.user)
router.post("/", verifyToken, async (req, res) => {
    try {
        // req.user gets populated by the verifyToken 
        // middleware req.user = {_id: "1411412jm1w", username: "valodik"}
        req.body.author = req.user._id
        const hoot = await Hoot.create(req.body)
        hoot._doc.author = req.user
        res.status(201).json(hoot)
    } catch (err) {
        res.status(500).json({err: err.message})
    } 
})

// Show GET /hoots/:hootId
router.get("/:hootId", verifyToken, async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate([
            "author",
            "comments.author"
        ])
        res.status(200).json(hoot)
    } catch (error) {
        res.status(500).json({err: error.message})
    }
})

// Update PUT /hoots/:hootId
router.put("/:hootId", verifyToken, async (req, res) => {
    try {
        // Find the hoot
        const hoot = await Hoot.findById(req.params.hootId)

        // Check permissions
        if(!hoot.author.equals(req.user._id)) {
            return res.status(403).send("Your not allowed to do that!")
        }

        // Update hoot
        const updatedHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            { new : true } // tell the updatedHoot to give use the new values   
        )
        // append req.user to the author property
        updatedHoot._doc.author = req.user

        res.status(200).json(updatedHoot)

    } catch (error) {
        res.status(500).json({err: error.message})
    }
})

// Delete DELETE /hoots/:hootId
router.delete("/:hootId", verifyToken, async (req, res) => {
    try {
        // Find the hoot
        const hoot = await Hoot.findById(req.params.hootId)

        // Check permissions
        if(!hoot.author.equals(req.user._id)) {
            return res.status(403).send("Your not allowed to do that!")
        }

        // Deleted hoot
        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId)

        res.status(200).json(deletedHoot)

    } catch (error) {
        res.status(500).json({err: error.message})
    }
})

// Create Comment POST /hoots/:hootId/comments
router.post("/:hootId/comments", verifyToken, async (req, res) => {
    try {
        // req.body will be our comment we are tring to 
        // add the comments author to the req.body
        req.body.author = req.user._id 

        // Find hoot to add comment too
        const hoot =  await Hoot.findById(req.params.hootId)
        hoot.comments.push(req.body)

        // save the updated hoot with comment to the db
        await hoot.save()

        // Find the newly created comment
        const newComment = hoot.comments[hoot.comments.length -1]

        console.log(newComment)
        // populate the author on that new comment
        newComment._doc.author = req.user

        res.status(201).json(newComment)
    } catch (error) {
        res.status(500).json({ err: error.message });
    }
})

module.exports = router