import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true }, // Name optional in WhatsApp 
  email: { type: String, unique: true, sparse: true, default: null }, // Web users ke liye unique
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