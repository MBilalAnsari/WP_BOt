import { sendButtonMessage, sendListMessage, sendLocationMessage, sendPhotoMessage, sendTextMessage } from "../../../helper/messageHelperForVendor.js";
import { topFunctionHandler } from "../../../helper/topFunction.js";
import { uploadWhatsAppImage } from "../../../helper/uploadBusinessPhoto.js";
import Vendor from "../../../models/Vendor.js";
// import { shopCategory } from "../constants/shopCategory";


const sendVendorButtonMessage = sendButtonMessage;
const sendVendorListMessage = sendListMessage;
const sendVendorTextMessage = sendTextMessage;
const sendVendorPhotoMessage = sendPhotoMessage;
export { sendVendorButtonMessage, sendVendorListMessage, sendVendorTextMessage, sendVendorPhotoMessage }

export const shopCategory = [
    { id: 1, title: "grocery" },
    { id: 2, title: "clothing" },
    { id: 3, title: "electronics" },
    { id: 4, title: "salon & Beauty" },
    { id: 5, title: "food & Beverages" }
];


export const registerVendor = async (messageData, userLanguages) => {

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
        s_v_ln,
        s_u_ln,
        lang
    } = messageData;

    const { longitude, latitude } = location;
    const { imageId, sha256, mimeType } = image;
    const isImageEmpty = !(image.imageId?.trim() || image.mimeType?.trim() || image.sha256?.trim());

    console.log("registerVendor")
    console.log(s_v_ln, "lagngdsf")


    let vendor = await Vendor.findOne({ phoneNumber });

    if (btnReply?.toLowerCase() === "register_shop" || vlastMessage === "0.2.0") {
        await sendTextMessage(phoneNumber, lang[s_v_ln].REGISTER_CONFIRM, "0.2.1");
        await sendTextMessage(phoneNumber, lang[s_v_ln].ENTER_FULL_NAME, "0.2.1");
    }
    else if (text && vendor?.lastMessage === "0.2.1") {
        console.log("vendor ke naam ke ander", text);

        const isValidName = (text) => /^[A-Za-z\s]+$/.test(text);
        if (!isValidName(text)) {
            await sendTextMessage(phoneNumber, lang[s_v_ln].INVALID_NAME, "0.2.1");
            return;
        }

        vendor.vendorFullName = text;
        await vendor.save();
        await sendTextMessage(phoneNumber, lang[s_v_ln].ENTER_SHOP_NAME, "0.2.2");
    }
    else if (text && vlastMessage === "0.2.2") {
        const isValidShopName = (text) => /^[A-Za-z0-9\s]+$/.test(text);
        if (!isValidShopName(text)) {
            await sendTextMessage(phoneNumber, lang[s_v_ln].INVALID_SHOP_NAME, "0.2.2");
            return;
        }

        vendor.shopName = text;
        await vendor.save();
        await sendTextMessage(phoneNumber, lang[s_v_ln].ENTER_SHOP_ADDRESS, "0.2.3");
    }
    else if (text && vlastMessage === "0.2.3") {
        console.log("location wali");

        const isValidAddress = (address) => /^[A-Za-z0-9\s,.-/#]+$/.test(address);
        if (!isValidAddress(text)) {
            await sendTextMessage(phoneNumber, lang[s_v_ln].INVALID_ADDRESS, "0.2.3");
            return;
        }

        vendor.address = text;
        await vendor.save();

        //  Call updated sendLocationMessage function
        await sendLocationMessage(phoneNumber, lang[s_v_ln].ENTER_PINNED_LOCATION, "0.2.4");
    }
    else if (vendor?.lastMessage === "0.2.4" && location?.latitude && location?.longitude) {
        if (!location?.latitude || !location?.longitude) {
            await sendTextMessage(phoneNumber, lang[s_v_ln].INVALID_LOCATION, "0.2.4");
            return;
        }
        vendor.pinLocation.coordinates = [longitude, latitude];
        await vendor.save();
        await sendTextMessage(phoneNumber, lang[s_v_ln].SEND_SHOP_PHOTO, "0.2.5");
    }
    else if (!isImageEmpty && vlastMessage === "0.2.5") {
        //  WhatsApp se image ID lo
        const image = imageId
        console.log("imageeee id", image)
        if (image) {
            const imageUrl = await uploadWhatsAppImage(imageId, mimeType);
            console.log("Generated Image URL:", imageUrl);

            if (imageUrl) {
                console.log("if ky andar imageURL");

                const updateResult = await Vendor.updateOne(
                    { _id: vendor._id },
                    { $set: { shopImg: imageUrl } }
                );

                console.log("MongoDB Update Result:", updateResult);

                if (updateResult.modifiedCount > 0) {
                    await sendPhotoMessage(phoneNumber, imageUrl, lang[s_v_ln].UPLOAD_SUCCESS_PHOTO);
                } else {
                    console.error("Shop Image Update Failed!");
                    await sendTextMessage(phoneNumber, lang[s_v_ln].FAILED_UPLOAD_PHOTO);
                }
            }
        } else {
            await sendTextMessage(phoneNumber, "lang[s_v_l].NO_IMAGE_FOUND");
        }
        const categories = shopCategory.map((category) => `${category.id}. ${category.title}`).join("\n");
        const message = lang[s_v_ln].SELECT_CATEGORY.replace("{categories}", categories);
        await sendTextMessage(phoneNumber, message, "0.2.6");
    }
    else if (text && vlastMessage === "0.2.6") {
        const selectedIds = text.split(",").map(num => Number(num.trim())).filter(num => !isNaN(num));
        const idList = shopCategory.map((category) => category.id);

        if (!selectedIds.every(num => idList.includes(num))) {
            await sendTextMessage(phoneNumber, lang[s_v_ln].INVALID_CATEGORY_NUMBER, "0.2.6");
            return;
        }

        vendor.shopCategory = selectedIds.map(id => shopCategory.find(cat => cat.id === id).title);
        await vendor.save();

        await sendButtonMessage(phoneNumber, lang[s_v_ln].CATEGORY_CONFIRM.replace("{selectedCategories}", vendor.shopCategory.join("\n")), [{ id: "Confirm", title: lang[s_v_ln].CONFIRM_BUTTON }, { id: "Re_Select", title: lang[s_v_ln].RESELECT_BUTTON }], "0.2.7");
    }
    else if (vlastMessage === "0.2.7" && btnReply?.toLowerCase() === "re_select") {
        const categories = shopCategory.map((category) => `${category.id}. ${category.title}`).join("\n");

        const message = `${lang[s_v_ln].RESELECT_CATEGORY}\n\n${categories}\n\n${lang[s_v_ln].CATEGORY_INSTRUCTIONS}`;
        await sendTextMessage(phoneNumber, message, "0.2.6");
    }
    else if (vlastMessage === "0.2.7" && btnReply?.toLowerCase() === "confirm") {
        await vendor.save();
        await sendTextMessage(phoneNumber, lang[s_v_ln].SHOP_REGISTER_SUCCESS, "0.2.8");
    } else {
        await topFunctionHandler(messageData, sendButtonMessage, true)
    }
}
