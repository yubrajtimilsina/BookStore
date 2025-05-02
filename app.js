require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const user = require("./routes/user");
const Books = require("./routes/book");
const Favourite = require("./routes/favourite");
const Cart = require("./routes/cart");
const Order = require("./routes/order");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; // Fallback to 5000 if PORT is not set

// Start Server
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", user);
app.use("/api/v1", Books);
app.use("/api/v1", Favourite);
app.use("/api/v1", Cart);
app.use("/api/v1", Order);

// Database Connection
const conn = async () => {
    try {
        await mongoose.connect(process.env.URI);
        console.log("Connected to database");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};
conn();
