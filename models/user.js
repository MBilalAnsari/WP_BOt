import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true }, 
  email: { type: String, unique: true, sparse: true }, 
  password: { type: String, minlength: 6 },
  phoneNumber: { type: String, unique: true }, 
  coins: { type: Number, default: 50 }, 
  registrationSource: { type: String, enum: ["whatsapp", "web"] },
  searchHistory: [{ query: String, timestamp: { type: Date, default: Date.now } }],
  language: { type: String, default: "en" }, 
  currentSearch: { type: String },
  lastMessage: { type: String },
  queryMess: { type: String },
  locationPage: { type: Number }, 
  category: { type: String }, 
  location: { type: String }, 
  searchTerm: { type: String }, 
  pinLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [24.8607, 67.0011] }, 
},
  searchCategory: [{ type: String, trim: true }],
  radius: { type: Number }, 
  currentStep: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;