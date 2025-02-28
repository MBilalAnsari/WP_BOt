
const verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_custom_token"; 
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

        // console.log("Received Token:", token); 
        // console.log("Expected Token:", VERIFY_TOKEN);

    if (mode && token === VERIFY_TOKEN) {
        console.log("✅ Webhook Verified!");
        return res.status(200).send(challenge);
    } else {
        console.error("❌ Verification Failed! Token Mismatch.");
        return res.sendStatus(403);
    }
};

module.exports = {verifyWebhook}