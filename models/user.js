// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     phone: { type: String, required: true, trim: true, unique: true }, // ✅ Unique phone number
//     name: { type: String}, // ✅ New: User's name
//     // email: { type: String, default: null, unique: true }, // ✅ New: User's email
//     // password: { type: String, default: null }, // ✅ New: User's password (plain for now)
//     registrationSource: { type: String, enum: ["whatsapp", "web"] },
//     language: { type: String, default: "en_US" },
//     currentSearch: { type: String },
//     lastMessage: { type: String},
    
//     locationPage: { type: Number},  // ✅ Handles paginated location selection
//     category: { type: String},   // ✅ Stores selected category
//     location: { type: String },   // ✅ Stores user's selected city
//     searchTerm: { type: String }, // ✅ Stores search keyword
//     radius: { type: Number},     // ✅ Stores search radius
    
//     currentStep: { type: String, default: null } // ✅ Tracks registration steps
// }, { timestamps: true });

// const User = mongoose.model("User", userSchema);
// module.exports = User;
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true }, // Name optional in WhatsApp
  email: { type: String, unique: true, sparse: true }, // Web users ke liye unique
  password: { type: String, minlength: 6 }, // Web users ke liye
  phoneNumber: { type: String , unique: true }, // ✅ Common field (WhatsApp + Web)
  coins: { type: Number, default: 50 }, // ✅ Users get 50 coins on registration
  registrationSource: { type: String , enum: ["whatsapp", "web"] }, // ✅ Tracks user source
  searchHistory: [ {query: String,timestamp: { type: Date, default: Date.now } }],
  language: { type: String, default: "en_US" }, // ✅ WhatsApp users ke liye language preference
  currentSearch: { type: String }, // ✅ WhatsApp bot ke liye
  lastMessage: { type: String }, // ✅ WhatsApp bot ke liye
  locationPage: { type: Number }, // ✅ Pagination in location selection
  category: { type: String }, // ✅ Stores selected category
  location: { type: String }, // ✅ Stores user's selected city
  searchTerm: { type: String }, // ✅ Stores search keyword
  radius: { type: Number }, // ✅ Stores search radius
  currentStep: { type: String, default: null } // ✅ Tracks registration steps (WhatsApp only)
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;