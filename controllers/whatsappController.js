import { sendTextMessage, sendButtonMessage, sendListMessage } from "../helper/messageHelper.js"
// import { sendButtonMessage, sendListMessage, sendTextMessage } from "../helper/messageHelperForVendor.js"
import { searchItem } from "../utils/botHandlerFunctions/searchTerm/searchTerm.js"
import { registerVendor } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js"
import Vendor from "../models/Vendor.js";
import User from "../models/user.js";


// const sendVendorButtonMessage = sendButtonMessage;
// const sendVendorListMessage = sendListMessage;
// const sendVendorTextMessage = sendTextMessage;

const profile_overview = [
    { id: "full_name", title: "👤 Full Name" },
    { id: "shop_name", title: "🏪 Shop Name" },
    { id: "shop_address", title: "🏠 Shop Address" },
    { id: "shop_category", title: "📦 Shop Category" },
    { id: "shop_location", title: "📍 Shop Location" },
    { id: "shop_image", title: "🖼️ Shop Image" }
]

export const handleIncomingMessage = async (req, res) => {

    // res.status(200).send(true);
    // console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    // console.log("📩 Incoming Message Entry:", messageEntry);

    // // ==> for mult over respond handling
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


    let btnReply = messageData.btnReply;

    if (["eng", "roman", "urdu"].includes(btnReply)) {
        if (vendor) {
            const mainMenuButtons = [
                { id: "search_item", title: "🔍 Search Item" },
                { id: "manage_account", title: "🤝 Manage account" }
            ];
            await sendButtonMessage(phoneNumber, "Language selected! Please choose an option below:", mainMenuButtons);

        } else {
            const mainMenuButtons = [
                { id: "search_item", title: "🔍 Search Item" },
                { id: "register_shop", title: "🤝 Register Shop" }
            ];
            await sendButtonMessage(phoneNumber, "Language selected! Please choose an option below:", mainMenuButtons);
        }
    }

    // manage acc for vendor
    if (["manage_account"].includes(btnReply)) {
        const manageAccountButtons = [
            { id: "profile_overview", title: "🌍 Profile Overview" },
            { id: "Update_profile", title: "📝 Update Profile" }
        ];
        await sendButtonMessage(phoneNumber, "Please choose an option below:", manageAccountButtons);
    }

    // profile overview for vendor
    if (["profile_overview"].includes(btnReply)) {
        const pinCord_one = vendor?.pinLocation?.coordinates[0];
        const pinCord_two = vendor?.pinLocation?.coordinates[1];
        const messgae = `Profile Overview:\n` +
            `Registration Date: ${vendor?.createdAt ? new Date(vendor.createdAt).toLocaleString() : "N/A"}\n` +
            `Shop Name: ${vendor?.shopName} \n` +
            `Shop Address: ${vendor?.address} \n` +
            `Shop Category: ${vendor?.shopCategory} \n` +
            `Shop Location: https://maps.google.com/maps?q=${pinCord_two},${pinCord_one}\n`;
        await sendTextMessage(phoneNumber, messgae);
    }


    // update profile for vendor
    if (["update_profile"].includes(btnReply)) {
        const profOverViewList = [{
            title: "Select Category",
            rows: profile_overview.map(update => ({ id: update.id, title: update.title }))
        }];
        await sendListMessage(phoneNumber, "Please select the field you want to update", "Select Category", profOverViewList);
    }
    if (["full_name"].includes(btnReply)) {
        await sendTextMessage(phoneNumber, "Please enter your full name");
    }



    // For User Search Term
    if (["search_item"].includes(btnReply) || user?.lastMessage?.startsWith("0.1")) {
        console.log("searchItem wali condition TRUE");
        await searchItem(messageData);
        console.log("📩 Updated User Last Message:", user?.lastMessage);
    }

    // For Reg Shop Term
    if (["register_shop"].includes(btnReply) || (vendor?.lastMessage?.startsWith("0.2"))) {
        console.log("Reg Vendor condition TRUE");
        await registerVendor(messageData);
        console.log("📩 Updated User Last Message:", user?.lastMessage);
    }

}











