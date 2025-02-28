const express = require("express");
const connectDB = require("./config/db");
const whatsappRoutes = require("./routes/whatsappRoutes");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios")
const app = express();

// // Middleware
app.use(cors());
app.use(express.json()); // JSON parse karne ke liye
app.use(express.urlencoded({ extended: true }));

connectDB();

// Use Routes
app.use("/api/whatsapp", whatsappRoutes);

app.get("/", (req, res) => {
    res.send("WhatsApp Bot is Running 🚀");
});



const PORT = process.env.PORT
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
