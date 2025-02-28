const { sendMessage } = require("../services/whatsappService");
const User = require("../models/user"); // Aapke schema ka model

const sendTextMessage = async (to, body , lastMessage) => {
    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body }
    };

    const response = await sendMessage(data);
    
    // ✅ Last message update sirf tab kare jab body ho
    if (lastMessage) {
        await updateLastMessage(to, lastMessage);
    }

    return response;
};

const sendButtonMessage = async (phone, text, buttons , lastMessage) => {
    const data = {
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text },
            action: {
                buttons: buttons.map(btn => ({
                    type: "reply",
                    reply: {
                        id: btn.id,
                        title: btn.title
                    }
                }))
            }
        }
    };

    const response = await sendMessage(data);
    
    // ✅ Last message update sirf tab kare jab text available ho
    if (lastMessage) {
        await updateLastMessage(phone, lastMessage )
    }

    return response;
};

// ✅ Function jo last message update karega sirf jab lastMessage ho
const updateLastMessage = async (phone, lastMessage) => {
    try {
        if (!lastMessage) return; // Agar lastMessage nahi hai toh return kar do

        await User.findOneAndUpdate(
            { phone }, // Find user by phone number
            { lastMessage }, // Update lastMessage field
            { upsert: true, new: true } // Agar user nahi mila to create kar do
        );
    } catch (error) {
        console.error("Error updating last message:", error.message);
    }
};

// ✅ **Send List Message**
const sendListMessage = async (to, body, buttonText, sections, lastMessage) => {
    const data = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            body: { text: body },
            action: {
                button: buttonText,
                sections: sections
            }
        }
    };

    const response = await sendMessage(data);

    if (lastMessage) {
        await updateLastMessage(to, lastMessage);
    }

    return response;
};

module.exports = { sendTextMessage, sendButtonMessage , sendListMessage};
