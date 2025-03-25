import axios from "axios";
import cloudinary from "../config/cloudinaryConfig.js";

export const uploadWhatsAppImage = async (imageId, mimeType) => {
    try {
        const accessToken = process.env.WHATSAPP_TOKEN ; // Replace this with your actual access token

        console.log("Received Image ID:", imageId);
        console.log("Expected MIME Type:", mimeType);

        // Step 1: Download Image from WhatsApp API
        const response = await axios({
            method: "GET",
            url: `https://graph.facebook.com/v22.0/${imageId}`,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Image URL from WhatsApp
        const imageUrl = response.data.url;
        console.log("Image URL:", imageUrl);

        //Step 2: Fetch Image Binary Data
        const imageBuffer = await axios({
            method: "GET",
            url: imageUrl,
            responseType: "arraybuffer",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log("Image Downloaded Successfully!");

        //Convert Image to Base64
        const base64Image = Buffer.from(imageBuffer.data).toString("base64");
        console.log("Base64 Converted Successfully!");

        //Step 3: Upload Image to Cloudinary
        console.log("Uploading to Cloudinary...");
        const uploadResponse = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64Image}`, {
            folder: "whatsapp_images"
        });

        console.log("Cloudinary Upload Successful:", uploadResponse);
        return uploadResponse.secure_url; //Return the Cloudinary URL

    } catch (error) {
        console.error("Image Upload Failed:", error.response?.data || error.message);
        return null;
    }
};
