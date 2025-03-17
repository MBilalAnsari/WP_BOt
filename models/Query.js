import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
    queryId: {type: String, require: true , unique: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    product: { type: String, required: true },
    status: { type: String, enum: ["waiting", "expired", "answered"], default: "waiting" },
    priceByVendor: { type: Number }
}, { timestamps: true });

const Query = mongoose.model("Query", querySchema);

export default Query;