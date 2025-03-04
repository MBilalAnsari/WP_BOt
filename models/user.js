const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, trim: true, unique: true }, // ✅ Unique phone number
    name: { type: String}, // ✅ New: User's name
    // email: { type: String, default: null, unique: true }, // ✅ New: User's email
    // password: { type: String, default: null }, // ✅ New: User's password (plain for now)
    registrationSource: { type: String, enum: ["whatsapp", "web"] },
    language: { type: String, default: "en_US" },
    currentSearch: { type: String },
    lastMessage: { type: String},
    
    locationPage: { type: Number},  // ✅ Handles paginated location selection
    category: { type: String},   // ✅ Stores selected category
    location: { type: String },   // ✅ Stores user's selected city
    searchTerm: { type: String }, // ✅ Stores search keyword
    radius: { type: Number},     // ✅ Stores search radius
    
    currentStep: { type: String, default: null } // ✅ Tracks registration steps
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
