import { sendTextMessage, sendButtonMessage, sendListMessage } from "../helper/messageHelper.js"
import { sendVendorTextMessage, sendVendorButtonMessage, sendVendorListMessage } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js";
import { searchItem } from "../utils/botHandlerFunctions/searchTerm/searchTerm.js"
import { registerVendor } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js"
import { shopCategory } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js";
import Vendor from "../models/Vendor.js";
import User from "../models/user.js";
import { vendorManageAccount } from "../utils/botHandlerFunctions/vendorManageAccount/regVendor.js";
import lang from "../utils/languagesJson/languages.json" assert { type: "json" };







export const handleIncomingMessage = async (req, res) => {

    res.status(200).send(true);

    // console.log("Request Body:", JSON.stringify(req.body, null, 2));

    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    // console.log("📩 Incoming Message Entry:", messageEntry);

    const phoneNumber = `+${messageEntry?.from || ""}`;

    const value = req.body?.entry?.[0]?.changes?.[0]?.value; // 👈 Common path extract kar liya
    const contact = value?.contacts?.[0];



    let user = await User.findOne({ phoneNumber });
    let vendor = await Vendor.findOne({ phoneNumber })
    let s_u_ln= user?.language || "en";
    let s_v_ln = vendor?.language || "en";

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
        vendor: vendor || null,
        s_u_ln: s_u_ln,
        s_v_ln: s_v_ln,
        lang: lang
    };

    console.log("📩 Processed Message PhoneNumber:", messageData.phoneNumber);
    console.log("📩 Processed Message text:", messageData.text);
    console.log("📩 Processed Message image:", messageData.image);
    console.log("📩 Processed Message location:", messageData.location);
    console.log("📩 Processed Message interactiveID BTN:", messageData.btnReply);
    console.log("📩 Processed Message interactiveID LIST:", messageData.listReply);

    
    let text = messageData.text;
    let vlastMessage = messageData.vlastMessage;

  

    if (text === "hi") {
        const s_ln = user?.language || vendor?.language || "en";
        console.log("s_lnnnnnn", s_ln);
        
        if (!lang[s_ln]) {
            console.error(`Invalid language: ${s_ln}, falling back to 'en'`);
        }
    
        const selLang = lang[s_ln] || lang["en"]; // Fallback to 'en' if undefined
    
        const langBtn = [
            { id: "en", title:selLang.ENG},
            { id: "rm", title:selLang.ROM},
            { id: "ur", title:selLang.URDU}
        ];
    
        await sendButtonMessage(phoneNumber, lang[s_ln].WLCM, langBtn);
    }
    
    
    
    let btnReply = messageData.btnReply;
    if (["en", "rm", "ur"].includes(btnReply)) {
        console.log("agyaaaaaaaaaa" , btnReply) 
        if (vendor) {
            vendor.language = btnReply;
            await vendor.save();
            const s_v_ln = vendor.language;
            const mainMenuButtons = [
                { id: "search_item", title: lang[s_v_ln].SRCH },
                { id: "manage_account", title: lang[s_v_ln].ACC }
            ];
            await sendVendorButtonMessage(phoneNumber, lang[s_v_ln].LAN_SEL, mainMenuButtons, "0.5");
        } else {
            vendor = new Vendor({ phoneNumber, language: btnReply });
            await vendor.save();
            const s_v_ln = vendor.language;
            const mainMenuButtons = [
                { id: "search_item", title: lang[s_v_ln].SRCH },
                { id: "register_shop", title: lang[s_v_ln].REG_SHOP }
            ];
            await sendButtonMessage(phoneNumber, lang[s_v_ln].LAN_SEL, mainMenuButtons);
        }
    }
    





    // For User Manage Account
    if ((["manage_account"].includes(btnReply) && vlastMessage?.startsWith("0.5")) || vlastMessage?.startsWith("0.5")) {
        console.log("manageAccount wali condition TRUE");
        await vendorManageAccount(messageData);
        console.log("Update Vendor Last Message:", vendor?.lastMessage);
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












