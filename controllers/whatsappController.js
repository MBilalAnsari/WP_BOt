import { sendTextMessage, sendButtonMessage, sendListMessage } from "../helper/messageHelper.js"
import { sendVendorTextMessage, sendVendorButtonMessage, sendVendorListMessage } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js";
import { searchItem } from "../utils/botHandlerFunctions/searchTerm/searchTerm.js"
import { registerVendor } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js"
import { shopCategory } from "../utils/botHandlerFunctions/vendorTerm/vendorTerm.js";
import Vendor from "../models/Vendor.js";
import User from "../models/user.js";
import { vendorManageAccount } from "../utils/botHandlerFunctions/vendorManageAccount/regVendor.js";
import langData from "../utils/languagesJson/languages.json" with { type: "json" };
const lang = langData;
import Query from "../models/Query.js";
import { topFunctionHandler } from "../helper/topFunction.js";

 





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
    let s_u_ln = user?.language || "en";
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

    // console.log("📩 Processed Message PhoneNumber:", messageData.phoneNumber);
    // console.log("📩 Processed Message text:", messageData.text);
    // console.log("📩 Processed Message image:", messageData.image);
    // console.log("📩 Processed Message location:", messageData.location);
    console.log("📩 Processed Message interactiveID BTN:", messageData.btnReply);
    // console.log("📩 Processed Message interactiveID LIST:", messageData.listReply);


    let text = messageData.text;
    let vlastMessage = messageData.vlastMessage;

    if (text === "hi") {
        await topFunctionHandler(messageData , sendButtonMessage);
    }


    let btnReply = messageData.btnReply;

    if (["en", "rm", "ur"].includes(btnReply)) {

        console.log("language selected", btnReply)

        if (!vendor) {
            vendor = new Vendor({ phoneNumber, language: btnReply });
            await vendor.save();
            console.log("New vendor created:", vendor);
        } else {
            vendor.language = btnReply;
            await vendor.save();
            console.log("Vendor language updated:", vendor.language);
        }

        // Check if user exists, if not create a new one
        if (!user) {
            user = new User({ phoneNumber, language: btnReply });
            await user.save();
            console.log("New user created:", user);
        } else {
            user.language = btnReply;
            await user.save();
            console.log("User language updated:", user.language);
        }

        let s_v_ln = vendor.language;
        let s_u_ln = user.language;
        console.log("vendor language selected", vendor.language);
        console.log("user language selected", user.language);

        const hasBothRadiusAndHasCategory = (user?.radius !== undefined && user?.radius !== null) && (Array.isArray(vendor?.shopCategory) && vendor.shopCategory.length > 0);

        if (hasBothRadiusAndHasCategory) {

            const mainMenuButtons = [
                { id: "search_item", title: lang[s_v_ln].SEARCH_ITEM },
                { id: "account_settings_both", title: lang[s_v_ln].ACCOUNT_SETTINGS }
            ];
            await sendButtonMessage(phoneNumber, lang[s_v_ln].LANGUAGE_SELECTED, mainMenuButtons);
        }

        const hasNotBothUserRadiusAndNoVendorCategory = (!user?.radius) && (!vendor?.shopCategory || vendor.shopCategory.length === 0);
        if (hasNotBothUserRadiusAndNoVendorCategory) {
            const mainMenuButtons = [
                { id: "search_item", title: lang[s_v_ln].SEARCH_ITEM },
                { id: "register_shop", title: lang[s_v_ln].REGISTER_SHOP }
            ];
            await sendButtonMessage(phoneNumber, lang[s_v_ln].LANGUAGE_SELECTED, mainMenuButtons);
        }

        const hasOnlyUser = (user && user?.radius !== undefined && user?.radius !== null) && (!vendor || !vendor?.shopCategory || vendor.shopCategory.length === 0);

        if (hasOnlyUser) {
            const mainMenuButtons = [
                { id: "search_item", title: lang[s_v_ln].SEARCH_ITEM },
                { id: "account_settings_user", title: lang[s_v_ln].ACCOUNT_SETTINGS },
                { id: "register_shop", title: lang[s_v_ln].REGISTER_SHOP }
            ];
            await sendButtonMessage(phoneNumber, lang[s_v_ln].LANGUAGE_SELECTED, mainMenuButtons);
        }

        const hasOnlyVendor = (!user || user?.radius === undefined || user?.radius === null) && (vendor && Array.isArray(vendor?.shopCategory) && vendor.shopCategory.length > 0);

        if (hasOnlyVendor) {
            const mainMenuButtons = [
                { id: "search_item", title: lang[s_v_ln].SEARCH_ITEM },
                { id: "account_settings_vendor", title: lang[s_v_ln].ACCOUNT_SETTINGS }
            ];
            await sendVendorButtonMessage(phoneNumber, lang[s_v_ln].LANGUAGE_SELECTED, mainMenuButtons);
        }
    }

    const selectedLang = user?.language || vendor?.language || "en";

    if (["account_settings_both"].includes(btnReply)) {
        console.log("account_settings_both wali condition TRUE");
        const manageAccountButtons = [
            { id: "account_settings_user", title: lang[selectedLang].ACC_USER_OPTION },
            { id: "manage_acc_vendor", title: lang[selectedLang].ACC_VENDOR_OPTION },
        ];
        await sendVendorButtonMessage(phoneNumber, lang[selectedLang].ACC_SETTINGS_SELECT, manageAccountButtons, "0.5");
    }

    // For User Manage Account Term
    if (["account_settings_user"].includes(btnReply)) {
        console.log("account_settings_user wali condition TRUE");
        const manageAccountButtons = [
            { id: "user_overview", title: lang[selectedLang].USER_ACC_OVERVIEW },
            { id: "user_account_update", title: lang[selectedLang].USER_ACC_UPDATE },
            { id: "user_history", title: lang[selectedLang].USER_ACC_HISTORY },
        ];
        await sendButtonMessage(phoneNumber, lang[selectedLang].ACC_USER_OPTION, manageAccountButtons);
    }

    // For user overview
    if (["user_overview"].includes(btnReply)) {
        console.log("user_overview wali condition TRUE");
        if (user) {
            await sendTextMessage(phoneNumber, `👤 ${lang[selectedLang].USER_ACC_OVERVIEW}
        \n👤 Name: ${messageData.profileName}
        \n📱 Phone: ${user.phoneNumber}
        \n💰 Coins: ${user.coins}`);
        }
    }

    // For user history update
    if (["user_history"].includes(String(btnReply))) {
        if (user) {
            const page = user.historyPage || 1;
            const limit = 5;
            const skip = (page - 1) * limit;

            const query = await Query.find({ userId: user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit + 1);

            console.log(query);

            if (query.length > 0) {
                const displayQueries = query.slice(0, limit);

                for (const q of displayQueries) {
                    await sendTextMessage(
                        phoneNumber,
                        `🔍 ${lang[selectedLang].USER_ACC_HISTORY}
                    \n📅 Date: ${q.createdAt}
                    \n🔍 Product: ${q.product}
                    \n💰 Price: ${q.priceByVendor || "Vendor not replied"}`
                    );
                }

                if (query.length > limit) {
                    const buttons = [{ id: "SeeMore", title: "See More" }];

                    await sendButtonMessage(phoneNumber, lang[selectedLang].USER_HISTORY_LOAD_MORE, buttons, "see_more");

                    await User.updateOne({ _id: user._id }, { $set: { historyPage: page + 1 } });
                }
            } else {
                await sendTextMessage(phoneNumber, lang[selectedLang].USER_HISTORY_EMPTY);
            }
        } else {
            await sendTextMessage(phoneNumber, lang[selectedLang].USER_NOT_FOUND_ERROR);
        }
    }

    // For user account update
    if (["user_account_update"].includes(btnReply)) {
        const accountUpdateButtons = [
            { id: "user_name_update", title: lang[selectedLang].USER_NAME_CHANGE },
            { id: "user_phone_update", title: lang[selectedLang].USER_PHONE_CHANGE },
            { id: "user_email_update", title: lang[selectedLang].USER_EMAIL_CHANGE },
        ];
        await sendButtonMessage(phoneNumber, lang[selectedLang].USER_ACC_UPDATE, accountUpdateButtons);
    }

    // For user name update
    if (["user_name_update"].includes(btnReply)) {
        await sendTextMessage(phoneNumber, lang[selectedLang].PROMPT_NEW_NAME);
    }

    // For user phone update
    if (["user_phone_update"].includes(btnReply)) {
        await sendTextMessage(phoneNumber, lang[selectedLang].PROMPT_NEW_PHONE);
    }

    // For user email update
    if (["user_email_update"].includes(btnReply)) {
        await sendTextMessage(phoneNumber, lang[selectedLang].PROMPT_NEW_EMAIL);
    }


    // For User Manage Account
    if ((["manage_acc_vendor"].includes(btnReply) && vlastMessage === "0.5") || vlastMessage?.startsWith("0.5")) {
        console.log("manageAccount wali condition TRUE");
        await vendorManageAccount(messageData);
        console.log("Update Vendor Last Message:", vendor?.lastMessage);
    }
    // For User Search Term
    if (["search_item"].includes(btnReply) || user?.lastMessage?.startsWith("0.1") || vendor?.lastMessage?.startsWith("0.1.7_") || user?.queryMess?.startsWith("0.1")) {
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












