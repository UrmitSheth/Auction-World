import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Ensure Cloudinary is configured with your environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'auction_world_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Accept multiple formats
        public_id: (req, file) => {
            // Sanitize file name (removes extension and replaces spaces/special chars with underscores)
            const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
            return `${Date.now()}-${cleanName}`;
        },
    },
});

// Create the multer instance with a 5MB size limit
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit enforced on the backend
});

export default upload;