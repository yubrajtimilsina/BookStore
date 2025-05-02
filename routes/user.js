const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

//sign up
router.post("/sign-up", async (req, res) =>{
    try {
        const { username, email, password, address} = req.body;

        //check username length
        if(username.length <4)
        {
            return res
            .status(400)
            .json({message : "Username length should be greater than three"});
        }

        //is username already exist or not
        const existingUsername = await User.findOne({username: username});
        if(existingUsername){
            return res
            .status(400)
            .json({message : "Username already Exists"});
        }

        //is email is exist
        const existingEmail = await User.findOne({email: email});
        if(existingEmail){
            return res
            .status(400)
            .json({message : "email already Exists"});
        }

        //check password length
        if(password.length<= 5){
            return res
            .status(400)
            .json({message : "length of password should be longer than six"});
        }
        const hashPass = await bcrypt.hash(password, 10);

        const newUser = new User ({username:username, email:email, password:hashPass, address:address});
        await newUser.save();
        return res.status(200).json({message : "Signup Successfully"});

    } catch (error) {
        res.status(500).json({message : "Internal server error"});
    }
});

//signin
router.post("/sign-in", async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid user" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            "bookStore123",  // Ensure the secret key is consistent
            { expiresIn: "30d" }
        );

        res.status(200).json({ id: existingUser._id, role: existingUser.role, token });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

//get-user information

router.get("/get-user-information", authenticateToken, async(req,res)=>{
    try {
        const {id} = req.headers;
        const data = await User.findById(id).select('-password');
        return res.status(200).json(data);
    } catch (error) {
        res.status(500).json({message : "Internal server error"});
    }
})

//update address
router.put("/update-address", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { address } = req.body; // Fixed typo (was 'red.body')

        // Validation
        if (!id || !address) {
            return res.status(400).json({ message: "User ID and address are required" });
        }

        // Update Address
        const updatedUser = await User.findByIdAndUpdate(id, { address }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Address updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Update Address Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;  