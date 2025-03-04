import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    vendorFullName:{type: String },
    shopName: { type: String, trim: true },
    email: { type: String, unique: true }, // Vendor Login
    password: { type: String, minlength: 8 },
    address: { type: String},
    phoneNumber: {
        type: String,
        required: true,
        match: [/^\+\d{1,3}\d{7,14}$/, "Invalid phone number format"] // Ensure valid format
    },
    shopImg: { type: String, default: "default.jpg" },
    pinLocation: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default:[24.8607,67.0011] }, // [longitude, latitude]
    },
    postalCode: { type: Number },
    country: { type: String },
    city: { type: String },
    shopCategory: [{ type: String, trim: true }],
    products: [{ type: String, trim: true }],
    responseHistory: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            action: String,
            timestamp: { type: Date, default: Date.now }
        }
    ]
});
vendorSchema.index({ pinLocation: "2dsphere" });
const vendor = mongoose.model('Vendor', vendorSchema);
export default vendor;

// The vendor model is created with the following fields:
// shopName: String
// password: String
// address: String
// shopImg: String
// pinLocation: { lat: Number, lng: Number }
// shopCategory: String
// The vendor model is exported as default.