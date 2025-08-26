// controllers/test-jwt.js

const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")

router.get('/sign-token', (req, res) => {
    const user = {
        _id: 1, 
        username: "valodik",
        password: "valodik00"
    }

    const token = jwt.sign({user}, process.env.JWT_SECRET)


  res.json({ token });
});

router.post("/verify-token", (req, res) => {

    try {
    const token =  req.headers.authorization.split(" ")[1] // ["Bearer, "<token>"][1]
    // if the token is valid and was signed with out secret key 
    // this will return whatever was in the payload when this token was ceate
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded // contains the user data that was storen on sing-in
     
    res.json({ decoded })
        
    } catch (error) {
        res.status(401).json({err: "Invalid Token"})
    }
  
})

module.exports = router;
