import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    queryId: { type: String, require: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    product: { type: String, required: true },
    shopImg: { type: String, default: "default.jpg" },
    status: { type: String, enum: ["waiting", "expired", "answered"], default: "waiting" },
    priceAsked: { type: Boolean, default: false }, // Kya price bhi poocha gaya?
    priceByVendor: { type: Number }, // Vendor ka diya hua price yahan store hoga
    contactViewed: { type: Boolean, default: false },
    priceViewed: { type: Boolean, default: false },
    detailsViewed: { type: Boolean, default: false },
    messageSent: { type: Boolean, default: false }, //  Kya message bheja gaya?
    sentAt: { type: Date }, // Message bhejne ka time
}, { timestamps: true });

const Query = mongoose.model("Query", querySchema);

export default Query;