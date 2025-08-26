const express = require("express")
const router = express.Router()       
const User = require("../models/user.js")  
const verifyToken = require("../middleware/verify-token.js")


// here we are protecting a route ensuring a user must be loggin to access any data
router.get("/", verifyToken, async ( req, res) => {
    try {
        const users = await User.find({}, "username")

        res.json(users)
    } catch (error) {
        res.status(500).json({err: err.message})
    }
})

// Here a user must be logged in and the can only access
// there own data
router.get("/:userId", verifyToken,  async (req, res ) => {

    try {
    // If the user is looking for the details of another user, block the request
    // Send a 403 status code to indicate that the user is unauthorized
    if(req.user._id !== req.params.userId) {
        return res.status(403).json({err: "Unauthorized" })
    }

        const user = await User.findById(req.params.userId)

        if (!user) {
            return res.status(404).json({err: "User not found"})
        }

        res.json({ user })

    } catch (error) {
        res.status(500).json({err: err.message})
    }
})

module.exports = router