import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

export const uploadToCloudinary = async (filePath) => {
    try {
        if (!filePath) return null

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(filePath, {resource_type: "auto"})
        console.log("File uploaded successfully", response.url);

        return response
    } catch (error) {
        console.log(error);
        //delete the file from the server
        fs.unlinkSync(filePath);
        return null
    }
}