import User from "../models/user.js";
import Vendor from "../models/Vendor.js";


export const topFunctionHandler = async (messageData, sendButtonMessage, isValidInput) => {
    const {
        phoneNumber,
        text,
        btnReply,
        listReply,
        lastMessage,
        image = {},
        location,
        messagingProduct,
        profileName,
        user,
        vlastMessage,
        vendor,
        s_v_ln,
        s_u_ln,
        lang
    } = messageData;
    console.log("IsvalidInp" , isValidInput)
    const s_ln = user?.language || vendor?.language || "en"; // Get saved language
    console.log("s_lnnnnnn", s_ln);
    const selLang = lang[s_ln] || lang["en"];

    if (!lang[s_ln]) {
        console.error(`Invalid language: ${s_ln}, falling back to 'en'`);
    }
    if (isValidInput) {
        console.log("Once True")
        const langBtn = [
            { id: "en", title: s_ln === "en" ? `${selLang.ENG}` : selLang.ENG },
            { id: "rm", title: s_ln === "rm" ? `${selLang.ROM}` : selLang.ROM },
            { id: "ur", title: s_ln === "ur" ? `${selLang.URDU}` : selLang.URDU }
        ];
        // Reset Last Message for User and Vendor
        await User.updateOne({ phoneNumber }, { lastMessage: null });
        await Vendor.updateOne({ phoneNumber }, { lastMessage: null });

        await sendButtonMessage(phoneNumber, selLang.INVALID_INP, langBtn);
    } else {
        console.log("other one")
        const langBtn = [
            { id: "en", title: s_ln === "en" ? `${selLang.ENG}` : selLang.ENG },
            { id: "rm", title: s_ln === "rm" ? `${selLang.ROM}` : selLang.ROM },
            { id: "ur", title: s_ln === "ur" ? `${selLang.URDU}` : selLang.URDU }
        ];
        // Reset Last Message for User and Vendor
        await User.updateOne({ phoneNumber }, { lastMessage: null });
        await Vendor.updateOne({ phoneNumber }, { lastMessage: null });

        await sendButtonMessage(phoneNumber, selLang.WLCM, langBtn);
    }

}

