import { connectDB } from "../connection.js"
import User from "../models/user.js"
import Login from "../models/Login.js"
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import { generateToken } from "../utils/jwt.js";
import { getClientIp, getLocationFromIp } from "../utils/geoDetails.js";
dotenv.config();


export const handleUserLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "All Fields are required" });
    try {
        await connectDB();
        const user = await User.findOne({ email });
        //  Checking user exists
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Password Validate
        const psswordValidate = await bcrypt.compare(password, user.password);
        if (!psswordValidate) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        // generating jwt token
        const token = generateToken(user._id, user.role);

        // Set HTTP-only cookie
        const isExternal = req.headers.host?.includes('trycloudflare.com') || req.headers.host?.includes('loca.lt') || req.headers.origin?.includes('trycloudflare.com');
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isExternal || process.env.NODE_ENV === "production",
            sameSite: isExternal ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        // Getting user gro location
        const ip = getClientIp(req);
        const userAgent = req.headers["user-agent"];
        const location = await getLocationFromIp(ip);

        // Preserve the user's existing country if they have one manually selected
        const updatedLocation = user.location?.country 
            ? { ...location, country: user.location.country } 
            : location;

        // Update user's last login and location
        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            location: updatedLocation,
            ipAddress: ip,
            userAgent: userAgent
        });

        // Saving login details
        const login = new Login({
            userId: user._id,
            ipAddress: ip,
            userAgent,
            location,
            loginAt: new Date(),
        })
        await login.save();

        return res.status(200).json({ message: "Login Successful" });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Server error from handle login" });
    }
}

export const handleUserSignup = async (req, res) => {
    await connectDB();
    const { name, email, password, country } = req.body;

    // Checking input fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        await connectDB();
        const existingUser = await User.findOne({ email });

        // Checking existing of user
        if (existingUser)
            return res.status(400).json({ error: "User already exists" });

        // Getting geo details and override country if user selected one
        const ip = getClientIp(req);
        const userAgent = req.headers["user-agent"];
        let location = await getLocationFromIp(ip);
        
        if (country) {
            location = { ...location, country };
        }

        // Hashing user password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Saving user to database
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            avatar: "https://avatar.iran.liara.run/public/7",
            ipAddress: ip,
            userAgent,
            location,
            signupAt: new Date(),
            lastLogin: new Date(),
        });
        await newUser.save();

        const login = new Login({
            userId: newUser._id,
            ipAddress: ip,
            userAgent,
            location,
            loginAt: new Date(),
        })
        await login.save();

        // Generating jwt token
        const token = generateToken(newUser._id, newUser.role);

        // Set HTTP-only cookie
        const isExternal = req.headers.host?.includes('trycloudflare.com') || req.headers.host?.includes('loca.lt') || req.headers.origin?.includes('trycloudflare.com');
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isExternal || process.env.NODE_ENV === "production",
            sameSite: isExternal ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
    }
}

export const handleUserLogout = async (req, res) => {
    const isExternal = req.headers.host?.includes('trycloudflare.com') || req.headers.host?.includes('loca.lt') || req.headers.origin?.includes('trycloudflare.com');
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: isExternal || process.env.NODE_ENV === "production",
        sameSite: isExternal ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
}