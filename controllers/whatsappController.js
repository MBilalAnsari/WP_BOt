import { sendTextMessage, sendButtonMessage, sendListMessage } from "../helper/messageHelper.js"
import { searchItem } from "../utils/botHandlerFunctions/SearchTerm/searchTerm.js";
import { registerVendor } from "../utils/botHandlerFunctions/VendorTerm/VendorTerm.js";
import Vendor from "../models/Vendor.js";
import User from "../models/user.js";




export const handleIncomingMessage = async (req, res) => {

    // console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    // console.log("📩 Incoming Message Entry:", messageEntry);

    // // ==> for mult over resp
    // if (!messageEntry || (messageEntry?.from && !messageEntry?.text?.body && !messageEntry.text?.body && !messageEntry.image && !messageEntry?.interactive?.list_reply?.id && !messageEntry?.interactive?.button_reply?.id)) {
    //     console.log("Invalid or empty message received.");
    //     return res.sendStatus(200);
    // }
    const phoneNumber = `+${messageEntry?.from || ""}`;

    const value = req.body?.entry?.[0]?.changes?.[0]?.value; // 👈 Common path extract kar liya
    const contact = value?.contacts?.[0];



    let user = await User.findOne({ phoneNumber });
    let vendor = await Vendor.findOne({ phoneNumber })

    const messageData = {
        vlastMessage: vendor?.lastMessage || "",
        lastMessage: user?.lastMessage || "",
        phoneNumber: `+${messageEntry?.from || ""}`,
        text: messageEntry?.text?.body?.trim().toLowerCase() || "",
        listReply: messageEntry?.interactive?.list_reply?.id?.toLowerCase() || "",
        btnReply: messageEntry?.interactive?.button_reply?.id?.toLowerCase() || "",
        image: {
            mimeType: messageEntry?.image?.mime_type || "",
            sha256: messageEntry?.image?.sha256 || "",
            imageId: messageEntry?.image?.id || ""
        },
        location: {
            latitude: messageEntry?.location?.latitude || null,
            longitude: messageEntry?.location?.longitude || null
        },
        messagingProduct: value?.messaging_product || "",
        profileName: contact?.profile?.name ?? "Unknown User",
        user: user || null,
    };

    console.log("📩 Processed Message PhoneNumber:", messageData.phoneNumber);
    console.log("📩 Processed Message text:", messageData.text);
    console.log("📩 Processed Message image:", messageData.image);
    console.log("📩 Processed Message location:", messageData.location);
    console.log("📩 Processed Message interactiveID BTN:", messageData.btnReply);
    console.log("📩 Processed Message interactiveID LIST:", messageData.listReply);

    let text = messageData.text;
    // let phoneNumber = messageData.phoneNumber;
    if (text === "hi") {
        const languageButtons = [
            { id: "eng", title: "🇬🇧 English" },
            { id: "roman", title: "🇵🇰 Roman Urdu" },
            { id: "urdu", title: "🏴 Urdu" }
        ];
        await sendButtonMessage(phoneNumber, "Hey there! 👋 Welcome! Before we get started, please choose your preferred language. 🌍", languageButtons, "");
    }

    let interactiveBtnID = messageData.btnReply;
    if (["eng", "roman", "urdu"].includes(interactiveBtnID)) {
        const mainMenuButtons = [ 
            { id: "search_item", title: "🔍 Search Item" },
            { id: "register_shop", title: "🤝 Register Shop" }
        ];
        await sendButtonMessage(phoneNumber, "✅ Language selected! Please choose an option below:", mainMenuButtons);
    }

    // For User Search Term
    if (["search_item"].includes(interactiveBtnID) || user?.lastMessage?.startsWith("0.1")) {
        console.log("searchItem wali condition TRUE");
        await searchItem(messageData);
        console.log("📩 Updated User Last Message:", user?.lastMessage);
    }

    // For Reg Shop Term
    if (["register_shop"].includes(interactiveBtnID) || (vendor?.lastMessage?.startsWith("0.2"))) {
        console.log("Reg Vendor condition TRUE");
        await registerVendor(messageData);
        console.log("📩 Updated User Last Message:", user?.lastMessage);
    }

}











