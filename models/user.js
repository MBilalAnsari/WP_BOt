const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, trim: true },
    language: { type: String, default: "en_US" },
    currentSearch: { type: String, default: null },
    lastMessage: { type: String, default: null },
    locationPage: { type: Number, default: 0 },  // ✅ Fix: locationPage added
    category: { type: String, default: null },
    location: { type: String, default: null },
    searchTerm: { type: String, default: null },
    radius: { type: Number, default: null }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
