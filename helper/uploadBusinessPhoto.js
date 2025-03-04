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
        if (!imageUrl) {
            throw new Error("❌ Image URL not found!");
        }
        console.log("✅ Image URL:", imageUrl);

        // 2️⃣ **Image Download Karo**
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const tempFilePath = path.join("temp", `business_${phoneNumber}_${Date.now()}.jpg`);
        fs.writeFileSync(tempFilePath, response.data);
        console.log("✅ Image downloaded at:", tempFilePath);

        // 3️⃣ **Cloudinary Pe Upload Karo**
        const uploadedImage = await cloudinary.uploader.upload(tempFilePath, {
            folder: "whatsapp_business_photos",
            public_id: `business_${phoneNumber}_${Date.now()}`
        });

        console.log("✅ Image uploaded to Cloudinary:", uploadedImage.secure_url);

        // 4️⃣ **Temp File Delete Karo**
        fs.unlinkSync(tempFilePath);
        console.log("🗑️ Temp file deleted!");

        return uploadedImage.secure_url;
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return null;
    }
};


//     try {
//         const response = await axios.get(`https://graph.facebook.com/v22.0/${mediaId}`, {
//             headers: {
//                 Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
//             },
//         });

//         return response.data.url || null;
//     } catch (error) {
//         console.error("❌ Error getting image URL:", error.response?.data || error.message);
//         return null;
//     }
// };


// const downloadImage = async (imageUrl, phoneNumber) => {
//     try {
//         const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

//         // 🔹 Image Temporary Folder Me Save Karo
//         const tempFilePath = path.join("temp", `business_${phoneNumber}_${Date.now()}.jpg`);
//         fs.writeFileSync(tempFilePath, response.data);

//         return tempFilePath;
//     } catch (error) {
//         console.error("❌ Error downloading image:", error.message);
//         return null;
//     }
// };

// const uploadToCloudinary = async (filePath, phoneNumber) => {
//     try {
//         const uploadedImage = await cloudinary.uploader.upload(filePath, {
//             folder: "whatsapp_business_photos",
//             public_id: `business_${phoneNumber}_${Date.now()}`
//         });

//         // 🔹 Temporary File Delete Karo
//         fs.unlinkSync(filePath);

//         return uploadedImage.secure_url;
//     } catch (error) {
//         console.error("❌ Error uploading image to Cloudinary:", error.message);
//         return null;
//     }
// };



// import cloudinary from "../config/cloudinaryConfig.js";
// import axios from "axios";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // 🔹 File Path Config
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ **Upload Business Photo**
// export const uploadBusinessPhoto = async (phoneNumber, imageId) => {
//     try {
//         const accessToken = process.env.WHATSAPP_TOKEN;
//         const mediaUrl = `https://graph.facebook.com/v22.0/${imageId}?access_token=${accessToken}`;

//         // Get media information from Facebook Graph API
//         const mediaResponse = await axios.get(mediaUrl);
//         const imageUrl = mediaResponse.data.url; // Get the actual image URL

//         // 🔹 Temporary Path Pe Image Save Karein
//         const imagePath = path.join(__dirname, `../temp/${imageId}.jpg`);

//         // 📥 **Step 1: Download Image**
//         const response = await axios({
//             method: "GET",
//             url: imageUrl,
//             responseType: "stream"
//         });

//         // ✅ Image ko local file me save karein
//         const writer = fs.createWriteStream(imagePath);
//         response.data.pipe(writer);

//         await new Promise((resolve, reject) => {
//             writer.on("finish", resolve);
//             writer.on("error", reject);
//         });

//         // ☁️ **Step 2: Cloudinary Pe Upload Karein**
//         const uploadedImage = await cloudinary.uploader.upload(imagePath, {
//             folder: "whatsapp_business_photos",
//             public_id: `business_${phoneNumber}_${Date.now()}`
//         });

//         // 🗑️ **Step 3: Local Image File Delete Karein**
//         fs.unlinkSync(imagePath);

//         // ✅ **Return Cloudinary Image URL**
//         return uploadedImage.secure_url;
//     } catch (error) {
//         console.error("❌ Error uploading image to Cloudinary:", error);
//         return null;
//     }
// };