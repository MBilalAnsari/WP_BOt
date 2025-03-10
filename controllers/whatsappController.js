import User from "../models/user.js";
import { sendTextMessage, sendButtonMessage, sendListMessage } from "../helper/messageHelper.js"
import { uploadBusinessPhoto } from "../helper/uploadBusinessPhoto.js";
import Vendor from "../models/Vendor.js";
const categories = [
    { id: "grocery", title: "🛒 Grocery" },
    { id: "clothing", title: "👗👕 Clothing" },
    { id: "electronics", title: "📱💻 Electronics" },
    { id: "salon_beauty", title: "💇‍♂️💅 Salon & Beauty" },
    { id: "food_beverages", title: "🍔☕ Food & Beverages" }
]; // Example, this makes it 4+ categories

const shopCategory = [
    { id: "grocery", title: "🛒 Grocery" },
    { id: "clothing", title: "👗👕 Clothing" },
    { id: "electronics", title: "📱💻 Electronics" },
    { id: "salon_beauty", title: "💇‍♂️💅 Salon & Beauty" },
    { id: "food_beverages", title: "🍔☕ Food & Beverages" }
];

export const handleIncomingMessage = async (req, res) => {
    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
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
        await sendButtonMessage(phoneNumber, "✅ Language selected! Please choose an option below:", mainMenuButtons, "0.1");
    }

    // For User Search Term
    if ((user?.lastMessage?.startsWith("0.1") && ["search_item"].includes(interactiveBtnID)) || user?.lastMessage?.startsWith("0.1")) {
        console.log("searchItem wali condition TRUE ✅");
        await searchItem(messageData);
        console.log("📩 Updated User Last Message:", user?.lastMessage);
    }

    // For Reg Shop Term
    if ((user?.lastMessage?.startsWith("0.1") && ["register_shop"].includes(interactiveBtnID)) || (vendor?.lastMessage?.startsWith("0.2"))) {
        console.log("Reg Vendor condition TRUE ✅");
        await registerVendor(messageData);
        console.log("📩 Updated User Last Message:", user?.lastMessage);
    }
}


const searchItem = async (messageData) => {
    const { phoneNumber, text, btnReply, listReply, lastMessage, image = {}, location, messagingProduct, profileName, user } = messageData;

    if (btnReply === "search_item" && lastMessage?.startsWith("0.1")) {
        console.log("what do you want to search")
        await sendTextMessage(phoneNumber, "✅ Great! Thanks for confirming. Now, tell me—what are you looking for today? 🔎", "0.1.1");
    }

    else if (text && lastMessage?.startsWith?.("0.1.1")) {
        console.log("yes or no")
        const imageButtons = [
            { id: "yes", title: "📸 Yes" },
            { id: "no", title: "❌ No" }
        ];
        await sendButtonMessage(phoneNumber, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.1.2");
    }

    else if (btnReply?.toLowerCase() === "yes" && lastMessage.trim() === "0.1.2") {
        console.log("Awesome! 🎉 Please upload the image.")
        await sendTextMessage(phoneNumber, "Awesome! 🎉 Please upload the image.", "0.1.3");
    }
    else if (btnReply?.toLowerCase() === "no" && lastMessage.trim() === "0.1.2") {
        if (categories.length > 3) {
            const categorySections = [{
                title: "Select a Category",
                rows: categories.map(cat => ({ id: cat.id, title: cat.title }))
            }];
            await sendListMessage(phoneNumber, "No worries! 😊 Choose a category:", "Categories", categorySections, "0.1.4");
        } else {
            await sendButtonMessage(phoneNumber, "No worries! 😊 Choose a category:", categories, "0.1.4");
        }
    }

    else if (categories.some(cat => cat.id === listReply && lastMessage === "0.1.4")) {
        user.searchCategory = listReply;
        await user.save();
        await sendTextMessage(phoneNumber, "Thanks! 🙌 Now, could you share your pin location so we can find options near you? 📍", "0.1.5");
    }

    else if (location?.latitude && location?.longitude && lastMessage === "0.1.5") {
        console.log("location agai", location)
        await sendTextMessage(phoneNumber, "Great! 👍 Lastly, how far should we search? Enter the radius in kilometers (e.g., 5, 10, etc.). 📏", "0.1.6");
    }

    else if (lastMessage === "0.1.6" && !isNaN(Number(text))) {
        console.log("MDG_PRODUCT", messagingProduct)
        try {
           const user = await User.findOneAndUpdate(
                { phoneNumber }, // Find user by phone number
                { registrationSource: String(messagingProduct) }, // Update lastMessage field
                { upsert: true, new: true } // Agar user nahi mila to create kar do
            );
            const buttons = [
                { id: "SearchHistory", title: "Search History" },
                { id: "Coins", title: "Coin" }
            ];
            await sendButtonMessage(phoneNumber, `🚀 Perfect! We’ll notify you as soon as we find the best matches.Welcome, ${profileName} !`, buttons, "0.8");
            const isMatchVendor = await Vendor.findOne({
                shopCategory: { $in: user.searchCategory } // ✅ Check if any searchCategory exists in shopCategory
            });
            // let vendornum = null;
            // After Searching Vendor it will Appears on user panel
            if (isMatchVendor) {
                console.log("✅ Match Found!");
                const buttons = [
                    { id: "Yes_avl", title: "Yes" },
                    { id: "No_avl", title: "No" }
                ];
                isMatchVendor.lastMessage = "ismatch_prod"; // ✅ Vendor ka last message update karo  
                isMatchVendor.temObj.messageSendToUsers = user.phoneNumber;
                user.tempObj.matchVendor = isMatchVendor.phoneNumber;
                await user.save()
                await isMatchVendor.save();  // ✅ Save vendor object properly
                const vendornum = isMatchVendor.phoneNumber;
                await sendButtonMessage(vendornum, `User is searching for ${user.searchTerm} Reply if available ? `, buttons, "0.1.7");
            }
        }
        catch (error) {
            console.error("❌ MongoDB Save/Contact Extraction Error:", error);
            await sendTextMessage(phoneNumber, "Oops! Something went wrong. Please try again.", "error");
        }
    }


    else if (btnReply?.toLowerCase() === "yes_avl" && lastMessage === "0.1.7") {
        console.log("✅ Vendor ne 'Yes' select kiya!");
        // vendor ka number niklega from whatsapp se
        // vendor find hoga
        // iski behalf per tempObj se user ka num
        const vendor = await Vendor.findOne({ phoneNumber });
        console.log("dekh beta arha ha ya nhi user", user)
        // const tempVendor = temp?.tempObj?.matchVendor;
        console.log("tempvendor", vendor)
        await sendTextMessage(vendor.phoneNumber, "Whats the price of this product", "0.1.8");
    }
    else if (text && lastMessage === "0.1.8") {
        const vendor = await Vendor.findOne({ phoneNumber });
        vendor.temObj.priceSendToUsers = text
        vendor.save();
        const buttons = [
            { id: "view_details", title: "View Details" }
        ];
        const userPhone = vendor.temObj.messageSendToUsers;
        await User.findOneAndUpdate(
            { phoneNumber: userPhone }, // Find user by phone number
            { $set: { "tempObj.priceByVendor": text } }, // Update nested field properly
            { new: true, upsert: true } // Returns updated document & creates if not exists
        );
        await sendButtonMessage(userPhone, "See to view the Vendor Details", buttons, "0.1.9")
    }


    else if (btnReply.toLowerCase() === "view_details" && lastMessage === "0.1.9") {
        const userFound = await User.findOne({ phoneNumber });
        console.log("unlock wali condition", userFound)

        // console.log("unlock wali condition")
        try {
            if (!userFound) {
                return "User not Found";
            }
            const vendorContactDetails = userFound.tempObj.matchVendor;
            const vendorDetails = await Vendor.findOne({ phoneNumber: vendorContactDetails });
            console.log("vendorDeatils", vendorDetails)
            const { pinLocation, address } = vendorDetails;
            console.log("P-locattion", pinLocation)
            console.log("Adress-", address)

            // const {} = shopImg ;
            // const { coordinates } = pinLocation;
            console.log(pinLocation, "pinloactio ")
            if (userFound.coins >= 1) {
                userFound.coins -= 1;
                const buttons = [
                    { id: "Unlock_contact", title: "Unlock Contact" },
                    { id: "Unlock_price", title: "Unlock Price" }
                ]
                await userFound.save();
                const msg = `Pin Location:${pinLocation.coordinates[0]} ${pinLocation.coordinates[1]}\n` +
                    `Shop Img: \n` +
                    `Adress: ${address}`;
                await sendButtonMessage(userFound.phoneNumber, msg, buttons, "0.1.9.1");
                console.log("check user coins", userFound.coins)
            } else {
                return "User has sufficient coins.";
            }

        } catch (error) {
            console.error("Error finding user:", error);
        }
    }
    else if (btnReply?.toLowerCase() === "unlock_contact") {
        console.log("Unlock_contact wala")
        const userFound = await User.findOne({ phoneNumber });
        console.log("unlock contact condition", userFound)
        try {
            if (!userFound) {
                return "User not Found";
            }
            const vendorContactDetails = userFound.tempObj.matchVendor;
            const vendorDetails = await Vendor.findOne({ phoneNumber: vendorContactDetails });
            const { vendorFullName, shopName, address, phoneNumber } = vendorDetails;
            if (userFound.coins >= 1) {
                userFound.coins -= 1;

                await userFound.save();
                await sendTextMessage(userFound.phoneNumber, `There is Contact Number\n` +
                    `Contact: ${phoneNumber}`, "0.1.9.1");
                // console.log("check user coins", userFound.coins)
                const userResult = await User.updateOne(
                    { phoneNumber: userFound.phoneNumber },
                    { $set: { "tempObj.matchVendor": "" } }
                );
                console.log("tempObj fields reset", userResult);
                const vendorResult = await Vendor.updateOne(
                    { phoneNumber: vendorDetails },
                    { $set: { "tempObj.messageSendToUsers": "" } }
                );
                console.log("tempObj fields reset", vendorResult);

            } else {
                return "User has sufficient coins.";
            }

        } catch (error) {
            console.error("Error finding user:", error);
        }
    }
    else if (btnReply?.toLowerCase() === "unlock_price") {
        const userFound = await User.findOne({ phoneNumber });
        console.log("unlock wali condition", userFound)
        // console.log("unlock wali condition")
        try {
            const vendorContactDetails = userFound.tempObj.matchVendor;
            const vendorDetails = await Vendor.findOne({ phoneNumber: vendorContactDetails });
            const priceProd = userFound.tempObj.priceByVendor;
            if (!userFound) {
                return "User not Found";
            }
            if (userFound.coins >= 1) {
                userFound.coins -= 1;
                await userFound.save();
                await sendTextMessage(userFound.phoneNumber, `Price is ${priceProd}.`);
                console.log("check user coins", userFound.coins)
                const userResult = await User.updateOne(
                    { phoneNumber: userFound.phoneNumber },
                    { $set: { "tempObj.priceByVendor": "" } }
                );
                console.log("tempObj fields reset", userResult);
                const vendorResult = await Vendor.updateOne(
                    { phoneNumber: vendorContactDetails },
                    { $set: { "tempObj.priceSendToUsers": "" } }
                );
                console.log("Vendor Update Result:", vendorResult);
                console.log("check user coins", userFound.coins)
            } else {
                return "User has sufficient coins.";
            }

        } catch (error) {
            console.error("Error finding user:", error);
        }
    }




}


const registerVendor = async (messageData) => {
    const { phoneNumber, text, btnReply, listReply, lastMessage, image = {}, location, messagingProduct, profileName, user, vlastMessage } = messageData;
    const { longitude, latitude } = location;
    const { imageId, sha256, mimeType } = image;
    let vendor = await Vendor.findOne({ phoneNumber });
    console.log("registerVendor")
    if (btnReply?.toLowerCase() === "register_shop" && lastMessage?.startsWith("0.1")) {
        const vendor = await Vendor.findOneAndUpdate(
            { phoneNumber }, // Find user by phone number
            { lastMessage: "0.2.1" }, // Update lastMessage field
            { upsert: true, new: true }); // Agar user nahi mila to create kar do
        await vendor.save()
        await sendTextMessage(phoneNumber, "✅ Great! Thanks for confirming. Now, let’s get you registered as a vendor. This will just take a few minutes. ⏳", "0.2.1");
        await sendTextMessage(phoneNumber, " 📝 First, please share your full name.", "0.2.1");
    }
    else if (text && vendor?.lastMessage === "0.2.1") {
        console.log("vendor ke naam ke ander", text)
        vendor.vendorFullName = text;
        vendor.lastMessage = "0.2.2"
        await vendor.save();
        await sendTextMessage(phoneNumber, " ✅ Got it! Now, what’s the name of your shop? 🏪");
    }
    else if (text && vlastMessage === "0.2.2") {
        // api hugee hasan ki implement
        vendor.shopName = text;
        vendor.lastMessage = "0.2.3";
        await vendor.save();
        await sendTextMessage(phoneNumber, "🏠 Please enter your shop's complete address (e.g., Street name, Area, City).");
    }
    else if (text && vlastMessage === "0.2.3") {
        // api hugee hasan ki implement
        vendor.address = text;
        vendor.lastMessage = "0.2.4"
        await vendor.save()
        await sendTextMessage(phoneNumber, "📍 Great! Now, please share your shop's exact location by sending a pinned location.", "pin_location")
    }
    else if (location?.latitude && location?.longitude && vlastMessage === "0.2.4") {

        vendor.pinLocation.coordinates[0] = longitude;
        vendor.pinLocation.coordinates[1] = latitude;
        vendor.lastMessage = "0.2.5"
        await vendor.save()
        await sendTextMessage(phoneNumber, "📸 Thanks! Now, send a clear photo of your shop.", "business_photo")
    }
    else if (imageId && vlastMessage === "0.2.5") {
        // 📸 WhatsApp se image ID lo
        const image = imageId
        console.log("imageeee id", image)
        if (image) {
            const imageUrl = await uploadBusinessPhoto(phoneNumber, image); // 🔹 Cloudinary pe upload karo
            console.log("image_URL imageeee id k baad", imageUrl)
            if (imageUrl) {
                // ✅ WhatsApp pe confirmatory message send karo
                console.log("if ky andar imageURL")
                await sendPhotoMessage(phoneNumber, imageUrl, "✅ Your business photo has been uploaded successfully! 📸");
                // 📩 Database me shop image save karo
                vendor.shopImg = imageUrl;
                await vendor.save();
            } else {
                await sendTextMessage(phoneNumber, "❌ Failed to upload your business photo. Please try again.");
            }
        } else {
            await sendTextMessage(phoneNumber, "❌ No image found! Please send a valid business photo.");
        }

        // 🏪 Shop Category Select Karne K a Process
        const buttons = [{ id: "go_other", title: "other" }];
        const shopSections = [{ title: "Select a Category", rows: shopCategory.map(shop => ({ id: shop.id, title: shop.title })) }];
        vendor.lastMessage = "0.2.6"
        await vendor.save()
        // 📩 List Message bhejna
        await sendListMessage(phoneNumber, "👍 Perfect! Now, choose the categories that best describe your shop. You can select multiple options by sending the numbers separated by commas (e.g., 2,4,3).", "Shopcategory", shopSections, "Shopcategory_selected");

        // 📩 Button Message bhejna (Others Option ke liye)
        await sendButtonMessage(phoneNumber, "Button: Others (Please specify) ✍️", buttons, "Shopcategory_selected");
    }
    else if (shopCategory.some(shop => shop.id === listReply && vlastMessage === "0.2.6")) {
        vendor.shopCategory[0] = listReply
        vendor.lastMessage = "0.2.7"
        await vendor.save()
        // console.log("shopcategory", messageEntry.interactive.list_reply.id.toLowerCase())
        await sendTextMessage(phoneNumber, "✅ Great! Your are now registered as Vendor..!");
    }
}
