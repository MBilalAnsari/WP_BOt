import { sendMessage } from "../services/whatsappService.js";
import Vendor from "../models/Vendor.js";

const sendTextMessage = async (to, body, lastMessage) => {
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

const sendButtonMessage = async (phone, text, buttons, lastMessage) => {
    console.log("📢 Button Message Text:", text); // Debugging
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
    // console.log( "dataaaaaaa",data) 

    const response = await sendMessage(data);

    // ✅ Last message update sirf tab kare jab text available ho
    if (lastMessage) {
        await updateLastMessage(phone, lastMessage)
    }

    return response;
};

// ✅ Function jo last message update karega sirf jab lastMessage ho
const updateLastMessage = async (phoneNumber, lastMessage) => {
    try {
        if (!lastMessage) return; // Agar lastMessage nahi hai toh return kar do

        await Vendor.findOneAndUpdate(
            { phoneNumber }, // Find user by phone number
            { lastMessage }, // Update lastMessage field
            { upsert: true, new: true } // Agar user nahi mila to create kar do
        );
    } catch (error) {
        console.error("Error updating last message:", error.message);
    }
};

// ✅ **Send List Message**
const sendListMessage = async (to, body, buttonText, sections, lastMessage) => {
    console.log("📤 Sending List Message...");
    console.log("📩 Request Data:", { to, body, buttonText, sections, lastMessage });
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

// ✅ Send Image Message Function
const sendPhotoMessage = async (phone, caption, imageUrl, lastMessage) => {
    const data = {
        messaging_product: "whatsapp",
        to: phone,
        type: "image",
        image: {
            link: imageUrl
        }
    };

    if (caption) {
        data.image.caption = caption || "";
    }

    const response = await sendMessage(data);

    if (lastMessage) {
        await updateLastMessage(phone, lastMessage);
    }

    return response;
};
const sendLocationMessage = async (phone, caption, lastMessage) => {
    const data = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "interactive",
        "interactive": {
            "type": "location_request_message",
            "body": {
                "text": caption
            },
            "action": {
                "name": "send_location"
            }
        }
    };

    const response = await sendMessage(data);

    if (lastMessage) {
        await updateLastMessage(phone, lastMessage);
    }

    return response;
};


export { sendTextMessage, sendButtonMessage, sendListMessage, sendPhotoMessage, sendLocationMessage }
