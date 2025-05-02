const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Book = require("../models/book")
const { authenticateToken } = require("./userAuth");

//add book && Admin

router.post("/add-book", authenticateToken, async (req, res) =>{
    try {
        const {id} =req.headers;
        const user = await User.findById(id)
        if(user.role !== "admin")
        {
            return res.status(400).json({message : "You donot have acess to perform"});
        }
        const book = new Book({
            url:req.body.url,
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            desc: req.body.desc,
            language: req.body.language,
        });
        await book.save();
        res.status(200).json({message:"Book added sucessfully"});
    } catch (error) {
        res.status(500).json({message : "Internal server error"});
    }
})

//update book
router.post("/update-book", authenticateToken, async (req, res) =>{
    try {
        const {bookid} =req.headers;
        await Book.findByIdAndUpdate(bookid, {
            url:req.body.url,
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            desc: req.body.desc,
            language: req.body.language,
        });
       
        return res.status(200).json({
            message : "Book Updated Successfully",
        });
    } catch (error) {
        return res.status(500).json({message : "Internal server error"});
    }
})

//delete book  by admin
router.delete("/delete-book", authenticateToken, async (req,res)=> {
    try {
        const {bookid} = req.headers;
        await Book.findByIdAndDelete(bookid);
        return res.status(200).json({
            message : "Book deleted Successfully",
        });
    } catch (error) {
        return res.status(500).json({message : "Internal server error"});     
    }
})

//to get all book

router.get("/get-all-books", async (req,res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1});
        return res.json({
            status: "Success",
            data: books,
        });
    } catch (error) {
        return res.status(500).json({message: "Internal server occur"});
    };
});

//get recently added books limited 4
router.get("/get-recent-books", async (req,res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1}).limit(4);
        return res.json({
            status: "Success",
            data: books,
        });
    } catch (error) {
        return res.status(500).json({message: "Internal server occur"});
    };
});

//get book by id
router.get("/get-book-by-id/:id", async (req,res) => {
    try {
        const { id } = req.params;
        const books = await Book.findById(id);
        return res.json({
            status: "Success",
            data: books,
        });
    } catch (error) {
        return res.status(500).json({message: "Internal server occur"});
    };
});

module.exports = router;