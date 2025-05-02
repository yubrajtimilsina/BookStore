const router = require("express").Router();
const User = require("../models/user");
const Order = require("../models/order");
const { authenticateToken } = require("./userAuth");
const axios = require('axios');

// Place Order (Common for COD and Khalti)
router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { order, paymentDetails } = req.body;
        let orderIds = [];

        for (const orderData of order) {
            const newOrder = new Order({
                user: id,
                book: orderData._id,
                paymentDetails,
            });
            const savedOrder = await newOrder.save();
            orderIds.push(savedOrder._id);

            await User.findByIdAndUpdate(id, {
                $push: { orders: savedOrder._id },
                $pull: { cart: orderData._id },
            });
        }

        return res.json({
            status: "Success",
            message: "Order Placed Successfully",
            orderIds,
        });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
 
// Khalti verification (No .env used)
router.post('/verify-khalti-payment', authenticateToken, async (req, res) => {
    try {
        const { token, amount, order } = req.body;

        const response = await axios.post(
            'https://khalti.com/api/v2/payment/verify/',
            { token, amount },
            {
                headers: {
                    Authorization: `Key db7a347b9a2f479e99b0e2d9eb228b17`, // Hardcoded test key
                },
            }
        );

        if (response.status !== 200) {
            console.error("Khalti verification failed:", response.data);
            return res.status(400).json({ message: "Khalti verification failed", error: response.data });
        }

        const { id } = req.headers;
        const orderIds = [];

        for (const orderData of order) {
            const newOrder = new Order({
                user: id,
                book: orderData._id,
                paymentDetails: { type: 'khalti', transactionId: token },
            });
            const savedOrder = await newOrder.save();
            orderIds.push(savedOrder._id);

            await User.findByIdAndUpdate(id, {
                $push: { orders: savedOrder._id },
                $pull: { cart: orderData._id },
            });
        }

        return res.status(200).json({
            message: "Payment verified and order placed successfully!",
            data: response.data,
            orderIds,
        });
    } catch (err) {
        console.error("Khalti verify error:", err.response?.data || err.message);
        res.status(400).json({
            message: "Payment verification failed",
            error: err.response?.data || err.message,
        });
    }
});

// Get order history of a particular user
router.get("/get-order-history", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const userData = await User.findById(id).populate({
            path: "orders",
            populate: { path: "book" },
        });

        const ordersData = userData.orders.reverse();
        return res.json({
            status: "Success",
            data: ordersData,
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get all orders (admin)
router.get("/get-all-order", authenticateToken, async (req, res) => {
    try {
        const allOrders = await Order.find()
            .populate({ path: "book" })
            .populate({ path: "user" })
            .sort({ createdAt: -1 });

        return res.json({
            status: "Success",
            data: allOrders,
        });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Update order status (admin)
router.put("/update-status/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json({
            status: "Success",
            message: "Status Updated Successfully",
            data: updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
