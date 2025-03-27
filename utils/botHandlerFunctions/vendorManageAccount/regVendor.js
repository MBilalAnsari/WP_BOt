import { sendVendorButtonMessage, sendVendorListMessage, sendVendorTextMessage, sendVendorPhotoMessage } from "../../botHandlerFunctions/vendorTerm/vendorTerm.js";
import { shopCategory } from "../../botHandlerFunctions/vendorTerm/vendorTerm.js";
import Vendor from "../../../models/Vendor.js";
import { uploadWhatsAppImage } from "../../../helper/uploadBusinessPhoto.js";


const profile_overview = [
    { id: "full_name", title: "👤 Full Name" },
    { id: "shop_name", title: "🏪 Shop Name" },
    { id: "shop_address", title: "🏠 Shop Address" },
    { id: "shop_category", title: "📦 Shop Category" },
    { id: "shop_location", title: "📍 Shop Location" },
    { id: "shop_image", title: "🖼️ Shop Image" }
];

export const vendorManageAccount = async (messageData) => {
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

    console.log("AT Vendor Manage Account")
    const { longitude, latitude } = location;
    const { imageId, sha256, mimeType } = image;


    if (["manage_acc_vendor"].includes(btnReply) || (["manage_acc_vendor"].includes(btnReply) && vlastMessage?.startsWith("0.5.2"))) {
        const manageAccountButtons = [
            { id: "profile_overview", title: lang[s_v_ln].PROFILE_OVERVIEW },
            { id: "update_profile", title: lang[s_v_ln].UPD_PROFILE }
        ];
        await sendVendorButtonMessage(phoneNumber, lang[s_v_ln].MANAGE_ACCOUNT, manageAccountButtons, "0.5.1");
    }

    // profile overview for vendor
    if ((["profile_overview"].includes(btnReply) && vlastMessage?.startsWith("0.5.1")) || (["profile_overview"].includes(btnReply) && vlastMessage?.startsWith("0.5.2"))) {
        const pinCord_one = vendor?.pinLocation?.coordinates[0];
        const pinCord_two = vendor?.pinLocation?.coordinates[1];
        const message = lang[s_v_ln].PROFILE_DETAILS
            .replace("{createdAt}", vendor?.createdAt ? new Date(vendor.createdAt).toLocaleString() : "N/A")
            .replace("{vendorFullName}", vendor?.vendorFullName || "N/A")
            .replace("{shopName}", vendor?.shopName || "N/A")
            .replace("{address}", vendor?.address || "N/A")
            .replace("{shopCategory}", vendor?.shopCategory || "N/A")
            .replace("{location}", `https://maps.google.com/maps?q=${pinCord_two},${pinCord_one}` || "N/A");

        if (vendor?.shopImg) {
            await sendVendorPhotoMessage(phoneNumber, message, vendor.shopImg);
            vendor.lastMessage = "0.5.1"
            await vendor.save()
        } else {
            // Agar image nahi hai toh sirf text message bhejo
            await sendVendorTextMessage(phoneNumber, message, "0.5.1");
        }
    }


    // update profile for vendor
    if (["update_profile"].includes(btnReply) && vlastMessage?.startsWith("0.5.1")) {
        const profOverViewList = [{
            title: "Select Category",
            rows: profile_overview.map(update => ({ id: update.id, title: update.title }))
        }];
        await sendVendorListMessage(phoneNumber, lang[s_v_ln].UPDATE_PROFILE_MSG, "Select Category", profOverViewList, "0.5.2");
    }

    if (["full_name"].includes(listReply) && vendor?.lastMessage === "0.5.2") {
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].ENTER_FULL_NAME, "0.5.2.0");
    }

    if (text && vendor?.lastMessage === "0.5.2.0") {
        const isValidName = (text) => /^[A-Za-z\s]+$/.test(text);

        if (!isValidName(text)) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_NAME, "0.5.2.0");
            return;
        }

        vendor.vendorFullName = text;
        await vendor.save();

        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].FULL_NAME_UPDATED.replace("{vendorFullName}", vendor.vendorFullName), "0.5.2");
    }

    // Shop Name
    if (["shop_name"].includes(listReply) && vendor?.lastMessage === "0.5.2") {
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].ENTER_SHOP_NAME, "0.5.2.1");
    }

    if (text && vendor?.lastMessage === "0.5.2.1") {
        const isValidShopName = (text) => /^[A-Za-z\s]+$/.test(text);

        if (!isValidShopName(text)) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_SHOP_NAME, "0.5.2.1");
            return;
        }

        vendor.shopName = text;
        await vendor.save();
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].SHOP_NAME_UPDATED.replace("{shopName}", vendor.shopName), "0.5.2");
    }

    // Shop Address
    if (["shop_address"].includes(listReply) && vendor?.lastMessage === "0.5.2") {
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].ENTER_SHOP_ADDRESS, "0.5.2.2");
    }

    if (text && vendor?.lastMessage === "0.5.2.2") {
        const isValidAddress = (address) => /^[A-Za-z0-9\s,.-/#]+$/.test(address);

        if (!isValidAddress(text)) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_ADDRESS, "0.5.2.2");
            return;
        }

        vendor.address = text;
        await vendor.save();

        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].SHOP_ADDRESS_UPDATED.replace("{address}", vendor.address), "0.5.2");
    }

    // Shop Category
    if (["shop_category"].includes(listReply) && vendor?.lastMessage === "0.5.2") {
        const categories = shopCategory.map((category) => `${category.id}. ${category.title}`).join("\n");
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].SELECT_SHOP_CATEGORY.replace("{categories}", categories), "0.5.2.3");
    }


    if (text && vendor?.lastMessage === "0.5.2.3") {
        const idList = shopCategory.map((category) => category.id);
        const isValidNumAndComma = (input) => /^[0-9,\s]+$/.test(input);

        if (!isValidNumAndComma(text)) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_CATEGORY, "0.5.2.3");
            return;
        }

        const selectedIds = text.split(",").map(num => Number(num.trim())).filter(num => !isNaN(num));

        if (selectedIds.length === 0 || !selectedIds.every(num => idList.includes(num))) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_CATEGORY, "0.5.2.3");
            return;
        }

        const selectedCategories = selectedIds.map(category => shopCategory[category - 1].title);
        vendor.shopCategory = selectedCategories;
        await vendor.save();

        const showCategory = vendor.shopCategory.map((category, index) => `${index + 1}. ${category}`).join("\n");
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].CATEGORY_UPDATED.replace("{shopCategory}", showCategory), "0.5.2");
    }

    //Shop Location
    if (["shop_location"].includes(listReply) && vendor?.lastMessage === "0.5.2") {
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].ENTER_SHOP_LOCATION, "0.5.2.4");
    }

    if (vendor?.lastMessage === "0.5.2.4") {
        if (!location?.latitude || !location?.longitude || text) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_LOCATION, "0.5.2.4");
            return;
        }

        vendor.pinLocation.coordinates[0] = longitude;
        vendor.pinLocation.coordinates[1] = latitude;
        await vendor.save();

        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].SHOP_LOCATION_UPDATED.replace("{latitude}", vendor.pinLocation.coordinates[1]).replace("{longitude}", vendor.pinLocation.coordinates[0]), "0.5.2");
    }

    // Shop Image Update
    if (["shop_image"].includes(listReply) && vendor?.lastMessage === "0.5.2") {
        await sendVendorTextMessage(phoneNumber, lang[s_v_ln].ENTER_SHOP_IMAGE, "0.5.3.4");
    }

    if (image && vendor?.lastMessage === "0.5.3.4") {
        if (!image || text) {
            await sendVendorTextMessage(phoneNumber, lang[s_v_ln].INVALID_IMAGE, "0.5.3.4");
            return;
        }
        if (image) {
            const imageUrl = await uploadWhatsAppImage(imageId, mimeType);
            console.log("Generated Image URL:", imageUrl);

            if (imageUrl) {
                console.log("if ky andar imageURL");

                const updateResult = await Vendor.updateOne(
                    { phoneNumber: vendor.phoneNumber },
                    { $set: { shopImg: imageUrl } }
                );

                console.log("MongoDB Update Result:", updateResult);

                if (updateResult.modifiedCount > 0) {
                    await sendVendorTextMessage(phoneNumber, lang[s_v_ln].SHOP_IMAGE_UPDATED, "0.5.2");
                } else {
                    console.error("Shop Image Update Failed!");
                    await sendTextMessage(phoneNumber, lang[s_u_ln].IMAGE_UPLOAD_FAILED, "0.1.3");
                }
            }
        }
    }
}