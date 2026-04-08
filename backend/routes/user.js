import express from 'express';
import { 
    handleGetUser, 
    handleChangePassword, 
    getLoginHistory,
    toggleWatchlist,  
    getWatchlist,
    updateProfilePhoto,
    updateProfileDetails, // Newly imported
    getPublicProfile
} from '../controllers/user.controller.js';
import upload from '../middleware/multer.js'; // Import multer

const userRouter = express.Router();

userRouter.get('/', handleGetUser);
userRouter.patch("/", handleChangePassword);
userRouter.get("/logins", getLoginHistory);

userRouter.get("/public/:id", getPublicProfile);

// Avatar Route (Protected by multer)
userRouter.post("/avatar", upload.single('avatar'), updateProfilePhoto);
userRouter.patch("/profile", updateProfileDetails); // NEW: Profile Details Update

userRouter.get("/watchlist", getWatchlist);           
userRouter.put("/watchlist/:id", toggleWatchlist);    

export default userRouter;