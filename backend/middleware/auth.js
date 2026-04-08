import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const secureRoute = (req, res, next) => {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
    }
};