import cloudinary from "../config/cloudinaryConfig.js";
import User from "../models/User.js";

export const uploadImage = async (req, res) => {
  try {
    const file = req.file; // Multer se image milegi

    if (!file) return res.status(400).json({ message: "Please upload an image" });

    // Image ko Cloudinary pe upload karna
    cloudinary.uploader.upload_stream(
      { folder: "user_uploads" }, // Folder ka naam
      async (error, uploadResult) => {
        if (error) return res.status(500).json({ message: "Upload failed" });

        // MongoDB me URL save karna
        const user = new User({ imageUrl: uploadResult.secure_url });
        await user.save();

        res.json({ message: "Image uploaded successfully", url: uploadResult.secure_url });
      }
    ).end(file.buffer);

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};
