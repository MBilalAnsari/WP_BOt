import axios from "axios";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinaryConfig.js"; // ✅ Cloudinary Config Import

export const uploadBusinessPhoto = async (phoneNumber, imageId) => {
    try {
        console.log("📩 Uploading Business Photo for:", phoneNumber, "Image ID:", imageId);

        // 1️⃣ **WhatsApp Media ID se Image URL lo**
        const mediaResponse = await axios.get(`https://graph.facebook.com/v22.0/${imageId}`, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
        });

        const imageUrl = mediaResponse.data.url;
        console.log("✅ Image URL:", imageUrl);

        if (!imageUrl) {
            throw new Error("❌ Image URL not found!");
        }

        // 2️⃣ **Ensure 'temp' directory exists**
        const tempDir = path.join("temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 3️⃣ **Image Download Karo**
        const tempFilePath = path.join(tempDir, `business_${phoneNumber}_${Date.now()}.jpg`);

        const response = await axios({
            method: "GET",
            url: imageUrl,
            responseType: "stream",
        });

        const writer = fs.createWriteStream(tempFilePath);

        await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        console.log("✅ Image downloaded at:", tempFilePath);

        // 4️⃣ **Cloudinary Pe Upload Karo**
        const uploadedImage = await cloudinary.uploader.upload(tempFilePath, {
            folder: "whatsapp_business_photos",
            public_id: `business_${phoneNumber}_${Date.now()}`,
        });

        console.log("✅ Image uploaded to Cloudinary:", uploadedImage.secure_url);

        // 5️⃣ **Temp File Delete Karo**
        fs.unlinkSync(tempFilePath);
        console.log("🗑️ Temp file deleted!");

        return uploadedImage.secure_url;
    } catch (error) {
        // console.error("❌ Error:", error.response?.data || error.message);
        return null;
    }
};
