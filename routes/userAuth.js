const jwt = require("jsonwebtoken");

// Middleware to Authenticate Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
    }

    jwt.verify(token, "bookStore123", (err, user) => {  // Ensure secret key matches sign-in
        if (err) {
            return res.status(403).json({ message: "Token expired, please sign in again" });
        }

        req.user = user;  // Save user data in request object
        next();
    });
};

module.exports = { authenticateToken };
