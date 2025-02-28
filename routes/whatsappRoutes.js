    const express = require("express");
    const { handleIncomingMessage} = require("../controllers/whatsappController");
    const {verifyWebhook} = require("../controllers/verifyWebhook")

    const router = express.Router();

    // Webhook Verification Route (For GET request)
    router.get("/webhook", verifyWebhook);

    // Handle Incoming Messages (For POST request)
    router.post("/webhook", handleIncomingMessage);

    module.exports = router;


