import { sendMessage } from "../services/whatsappService.js";
import User from "../models/user.js";
import Vendor from "../models/Vendor.js";

const sendTextMessage = async (to, body, lastMessage, queryMess) => {
    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body }
    };

    const response = await sendMessage(data);

    if (lastMessage) await updateLastMessage(to, lastMessage);
    if (queryMess) await updateQueryLastMessage(to, queryMess);

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

const sendButtonMessage = async (phone, text, buttons, lastMessage, queryMess) => {

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
    if (lastMessage) await updateLastMessage(phone, lastMessage);
    if (queryMess) await updateQueryLastMessage(phone, queryMess);

    return response;


};

const sendImageWithButtons = async (phone, imageUrl, text, buttons, lastMessage, queryMess) => {
    const data = {
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive: {
            type: "button",
            header: {
                type: "image",
                image: { link: imageUrl }
            },
            body: { text },
            action: {
                buttons: buttons.map(btn => ({
                    type: "reply",
                    reply: { id: btn.id, title: btn.title }
                }))
            }
        }
    };

    const response = await sendMessage(data);
    if (lastMessage) await updateLastMessage(phone, lastMessage);
    if (queryMess) await updateQueryLastMessage(phone, queryMess);

    return response;
};
const sendListMessage = async (to, body, buttonText, sections, lastMessage, queryMess) => {
    const data = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            body: { text: body || "\u200B" },
            action: {
                button: buttonText,
                sections: sections
            }
        }
    };

    const response = await sendMessage(data);

    if (lastMessage) await updateLastMessage(to, lastMessage);
    if (queryMess) await updateQueryLastMessage(to, queryMess);

    return response;
};

const sendPhotoMessage = async (phone, imageUrl, caption, lastMessage, queryMess) => {
    const data = {
        messaging_product: "whatsapp",
        to: phone,
        type: "image",
        image: { link: imageUrl }
    };

    if (caption) data.image.caption = caption;

    const response = await sendMessage(data);

    if (lastMessage) await updateLastMessage(phone, lastMessage);
    if (queryMess) await updateQueryLastMessage(phone, queryMess);

    return response;
};

const updateLastMessage = async (phoneNumber, lastMessage) => {
    try {
        if (!lastMessage) return;
        await User.findOneAndUpdate(
            { phoneNumber },
            { lastMessage },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Error updating last message:", error.message);
    }
};

const updateQueryLastMessage = async (phoneNumber, queryMess) => {
    try {
        if (!queryMess) return;
        await User.findOneAndUpdate(
            { phoneNumber },
            { queryMess },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error("Error updating query message:", error.message);
    }
};
const sendCTAButtonMessage = async (phone, ctaMess, lastMessage, queryMess) => {
    const { header, body, displayText, url } = ctaMess;

    const data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "interactive",
        interactive: {
            type: "cta_url",
            header: {
                type: "text",
                text: header
            },
            body: { text: body },
            action: {
                name: "cta_url",
                parameters: {
                    display_text: displayText,
                    url: url
                }
            }
        }
    };

    const response = await sendMessage(data);
    // return await sendMessage(data);
    if (lastMessage) await updateLastMessage(phone, lastMessage);
    if (queryMess) await updateQueryLastMessage(phone, queryMess);

    return response;
}; 
const sendImageWithLink = async (createWhatsAppCTAMessage ,lastMessage, queryMess) => {
    const { phone , imageUrl , bodyText , footerText, displayText, url} = createWhatsAppCTAMessage;
    // const data = {
    //     messaging_product: "whatsapp",
    //     to: phone,
    //     type: "interactive",
    //     interactive: {
    //         type: "cta_url",
    //         header: {
    //             type: "image",
    //             image: { link: imageUrl }
    //         },
    //         body: { text: bodyText },
    //         footer: { text: footerText },
    //         action: {
    //             name: "cta_url",
    //             parameters: {
    //                 display_text: buttonText,
    //                 url: buttonUrl
    //             }
    //         }
    //     }
    // };
    const data = {
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive: {
            type: "cta_url",
            header: {
                type: "image",
                image: { link: imageUrl }
            },
            body: { text: bodyText },
            footer: { text: footerText },
            action: {
                name: "cta_url",
                parameters: {
                    display_text: displayText,
                    url: url
                }
            }
        }
    };

    const response = await sendMessage(data);
    if (lastMessage) await updateLastMessage(phone, lastMessage);
    if (queryMess) await updateQueryLastMessage(phone, queryMess);

    return response;
};








export { sendTextMessage, sendButtonMessage, sendListMessage, sendPhotoMessage, sendLocationMessage, sendImageWithButtons, sendCTAButtonMessage, sendImageWithLink };
