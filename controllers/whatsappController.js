const User = require("../models/user");
const { sendTextMessage, sendButtonMessage, sendListMessage } = require("../helper/messageHelper");

const handleIncomingMessage = async (req, res) => {
    console.log("📥 Incoming Request:", JSON.stringify(req.body, null, 2));

    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!messageEntry) return res.sendStatus(400);

    const phone = messageEntry.from;
    const text = messageEntry.text?.body?.trim().toLowerCase();
    console.log("📞 Phone:", phone, "💬 Text:", text);

    let user = await User.findOne({ phone });
    if (!user) {
        user = new User({ phone, lastMessage: "", language: null, currentSearch: null, location: null });
        await user.save();
    }

    if (text === "hi") {
        user.language = null;
        user.currentSearch = null;
        await user.save();

        const languageButtons = [
            { id: "eng", title: "🇬🇧 English" },
            { id: "roman", title: "🇵🇰 Roman Urdu" },
            { id: "urdu", title: "🏴 Urdu" }
        ];
        await sendButtonMessage(phone, "Hey there! 👋 Welcome! Before we get started, please choose your preferred language. 🌍", languageButtons, "0.1");
    }

    else if (messageEntry?.type === "interactive" && messageEntry?.interactive?.type === "button_reply") {
        const buttonId = messageEntry.interactive.button_reply.id.toLowerCase();

        if (["eng", "roman", "urdu"].includes(buttonId)) {
            user.language = buttonId;
            await user.save();
            await sendTextMessage(phone, "✅ Great! Thanks for confirming. Now, tell me—what are you looking for today? 🔎", "0.2");
        }

        else if (buttonId === "yes") {
            user.currentSearch = "awaiting_image";
            await user.save();
            await sendTextMessage(phone, "Awesome! 🎉 Please upload the image.", "0.7");
        }

        else if (buttonId === "no") {
            const categoryButtons = [
                { id: "mobile_accessories", title: "📱 Mobile Accessories" },
                { id: "mobile_parts", title: "🔧 Mobile Parts" },
                { id: "others", title: "🛍️ Others" }
            ];
            await sendButtonMessage(phone, "No worries! 😊 To narrow it down, please select the category that best fits your search.", categoryButtons, "0.8");
        }

        else if (["mobile_accessories", "mobile_parts", "others"].includes(buttonId)) {
            user.lastMessage = buttonId;
            user.currentSearch = "location_request";
            await user.save();
            await sendTextMessage(phone, "Thanks! 🙌 Now, could you share your pin location so we can find options near you? 📍", "0.5");
        }
    }

    else if (user.currentSearch === "search_term") {
        user.searchTerm = text;
        await user.save();

        const imageButtons = [
            { id: "yes", title: "📸 Yes" },
            { id: "no", title: "❌ No" }
        ];
        await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
    }

    else if (user.currentSearch === "location_request") {
        user.location = text;
        user.currentSearch = "radius_request";
        await user.save();
        await sendTextMessage(phone, "Great! 👍 Lastly, how far should we search? Enter the radius in kilometers (e.g., 5, 10, etc.). 📏", "0.7");
    }

    else if (user.currentSearch === "radius_request" && !isNaN(Number(text))) {
        user.currentSearch = null;
        user.radius = Number(text);
        await user.save();
        await sendTextMessage(phone, "Perfect! 🚀 We're on it. We’ll notify you as soon as we find the best matches. Stay tuned! 🔔", "0.8");
    }

    else if (text.includes("display")) {
        user.currentSearch = "search_term";
        user.searchTerm = text;
        await user.save();

        const imageButtons = [
            { id: "yes", title: "📸 Yes" },
            { id: "no", title: "❌ No" }
        ];
        await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
    }

    res.sendStatus(200);
};

module.exports = { handleIncomingMessage };