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
    // console.log("📥 Incoming Request:", JSON.stringify(req.body, null, 2));npm s
    // const messagingProduct = req.body?.entry?.[0]?.changes?.[0]?.value?.messaging_product;
    // console.log("MDG_PRODUCT", messagingProduct)


    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    // const interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();

    let interactiveId;
    let vendornum;
    // if (messageEntry?.interactive?.type === "button_reply") {
    //     interactiveId = messageEntry.interactive.button_reply.id.toLowerCase();
    // } else if (messageEntry?.interactive?.type === "list_reply") {
    //     interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();
    // }
    // console.log("inteactiveid 12" , interactiveId )
    if (!messageEntry) return res.sendStatus(400);
    const { mime_type, sha256, id: imageId } = messageEntry.image || {};
    console.log("MIME Type:", mime_type);
    console.log("SHA256:", sha256);
    console.log("Image ID:", imageId);
    const { latitude, longitude } = messageEntry?.location || {};
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    // console.log(interactiveId, "reinitilized")

    const phoneNumber = `+${messageEntry.from}`;
    const text = messageEntry.text?.body?.trim().toLowerCase();
    console.log("📞 phoneNumber:", phoneNumber, "💬 Text:", text);

    let user = await User.findOne({ phoneNumber });

    let vendor = await Vendor.findOne({ phoneNumber });

    if (!vendor) {
        vendor = new Vendor({
            phoneNumber
        })
        await vendor.save()
    }

    // if (!user) {

    //     user = new User({ phoneNumber, lastMessage: "", language: null, currentSearch: null, location: null });
    //     await user.save();
    // }


    if (text === "hi") {

        // user.language = null;
        // user.currentSearch = null;
        // await user.save();

        const languageButtons = [
            { id: "eng", title: "🇬🇧 English" },
            { id: "roman", title: "🇵🇰 Roman Urdu" },
            { id: "urdu", title: "🏴 Urdu" }
        ];
        await sendButtonMessage(phoneNumber, "Hey there! 👋 Welcome! Before we get started, please choose your preferred language. 🌍", languageButtons, "0.1");
    }

    else if (messageEntry?.type === "interactive" && (messageEntry?.interactive?.type === "button_reply" || messageEntry?.interactive?.type === "list_reply")) {

        let interactiveId;
        console.log("inteactiveid", interactiveId)
        if (messageEntry?.interactive?.type === "button_reply") {
            interactiveId = messageEntry.interactive.button_reply.id.toLowerCase();
        } else if (messageEntry?.interactive?.type === "list_reply") {
            interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();
        }
        console.log("reiniailized upar wala", interactiveId)


        if (["eng", "roman", "urdu"].includes(interactiveId)) {
            // user.language = interactiveId;
            // await user.save();

            // ✅ Show Main Menu Buttons
            const mainMenuButtons = [
                { id: "search_item", title: "🔍 Search Item" },
                { id: "manage_account", title: "⚙️ Manage Account" },
                { id: "register_shop", title: "🤝 Register Shop" }
            ];

            await sendButtonMessage(phoneNumber, "✅ Language selected! Please choose an option below:", mainMenuButtons, "0.3");
        }
        // ✅ If user selects "Search Item"
        else if (interactiveId === "search_item") {
            user.currentSearch = "search_term";
            await user.save();
            await sendTextMessage(phoneNumber, "✅ Great! Thanks for confirming. Now, tell me—what are you looking for today? 🔎", "0.4");
        }
        // ✅ Handle "Manage Account"
        else if (interactiveId === "manage_account") {
            await sendTextMessage(phoneNumber, "⚙️ Manage Account options are coming soon!", "0.5");
        }
        // ✅ Handle "Register Shop"
        else if (interactiveId === "register_shop") {
            await sendTextMessage(phoneNumber, "✅ Great! Thanks for confirming. Now, let’s get you registered as a vendor. This will just take a few minutes. ⏳", "reg_vendor_name");
            await sendTextMessage(phoneNumber, " 📝 First, please share your full name.", "reg_vendor_name");
        }
        else if (interactiveId === "yes") {
            user.currentSearch = "awaiting_image";
            // await user.save();
            await sendTextMessage(phoneNumber, "Awesome! 🎉 Please upload the image.", "0.7");
        }
        else if (interactiveId === "no") {
            if (categories.length > 3) {
                const categorySections = [{
                    title: "Select a Category",
                    rows: categories.map(cat => ({ id: cat.id, title: cat.title }))
                }];

                await sendListMessage(phoneNumber, "No worries! 😊 Choose a category:", "Categories", categorySections, "0.8");
            } else {
                await sendButtonMessage(phoneNumber, "No worries! 😊 Choose a category:", categories, "0.8");
            }
        }
        if (categories.some(cat => cat.id === interactiveId && user.lastMessage === "0.8")) {
            user.lastMessage = interactiveId;
            user.currentSearch = "location_request";
            user.searchCategory = interactiveId;
            await user.save();
            await sendTextMessage(phoneNumber, "Thanks! 🙌 Now, could you share your pin location so we can find options near you? 📍", "0.5");
        }
        if (messageEntry?.interactive?.type === "list_reply" && vendor.lastMessage === "cat_list_sel") {
            interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();

            console.log("shopcategory wala", interactiveId)
            if (shopCategory.some(shop => shop.id === interactiveId)) {
                vendor.shopCategory[0] = messageEntry.interactive.list_reply.id.toLowerCase();
                await vendor.save()
                console.log("shopcategory", messageEntry.interactive.list_reply.id.toLowerCase())
                await sendTextMessage(phoneNumber, "Thanks! 🙌 Shop category has been selected");
            }
        }
        if (["coins"].includes(interactiveId)) {
            try {
                const userData = await User.findOne({ phoneNumber }, "coins"); // ✅ Get User Coins

                if (userData) {
                    await sendTextMessage(phoneNumber, `You have ${userData.coins} coins.`);
                } else {
                    await sendTextMessage(phoneNumber, "❌ No data found for this user.");
                }
            } catch (error) {
                console.error("❌ Error fetching coins:", error);
                await sendTextMessage(phoneNumber, "⚠️ Error fetching your coins. Please try again later.");
            }
        }
        if (shopCategory.some(shop => shop.id === interactiveId)) {
            vendor.shopCategory[0] = messageEntry.interactive.list_reply.id.toLowerCase();
            vendor.lastMessage = "cat_list_sel"
            await vendor.save()
            console.log("shopcategory", messageEntry.interactive.list_reply.id.toLowerCase())
            await sendTextMessage(phoneNumber, "Shop category has been selected");
        }
        // ✅ Vendor ne agar "No" ka button dabaya to ye chalega
        else if (interactiveId.toLowerCase() === "yes_avl") {
            console.log("✅ Vendor ne 'Yes' select kiya!");
            // vendor ka number niklega from whatsapp se
            // vendor find hoga
            // iski behalf per tempObj se user ka num
            const tempVendor = phoneNumber
            console.log("tempvendor", phoneNumber)
            await sendTextMessage(tempVendor, "Whats the price of this product", "pr_of_prd");
        }
        else if (interactiveId.toLowerCase().startsWith("unlock_price")) {
            const userFound = await User.findOne({ phoneNumber });
            console.log("unlock wali condition", userFound)
            // console.log("unlock wali condition")
            try {
                const priceProd = userFound.tempObj.priceByVendor;
                if (!userFound) {
                    return "User not Found";
                }
                if (userFound.coins >= 1) {
                    userFound.coins -= 1;
                    const buttons = [
                        { id: "Unlock_contact", title: "Unlock Contact" }
                    ]
                    await userFound.save();
                    await sendTextMessage(userFound.phoneNumber, `Price is ${priceProd}.`);
                    await sendButtonMessage(userFound.phoneNumber, "Unlock to see contact details", buttons)
                    console.log("check user coins", userFound.coins)
                } else {
                    return "User has sufficient coins.";
                }

            } catch (error) {
                console.error("Error finding user:", error);
            }
        }
        else if (interactiveId.toLowerCase().startsWith("unlock_contact")) {
            console.log("Unlock_contact wala")
            const userFound = await User.findOne({ phoneNumber });
            console.log("unlock wali condition", userFound)
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
                    await sendTextMessage(userFound.phoneNumber, `There is Shop Detail\n` +
                        `Name:${vendorFullName}\n` +
                        `Shop Name: ${shopName}\n` +
                        `Adress: ${address}\n` +
                        `Contact: ${phoneNumber}`);
                    console.log("check user coins", userFound.coins)
                } else {
                    return "User has sufficient coins.";
                }

            } catch (error) {
                console.error("Error finding user:", error);
            }
        }
        return
    }
    // else if (text.startsWith("display")) {
    //     user.currentSearch = "search_term";
    //     user.searchTerm = text;
    //     await user.save();

    //     const imageButtons = [
    //         { id: "yes", title: "📸 Yes" },
    //         { id: "no", title: "❌ No" }
    //     ];
    // await sendButtonMessage(phoneNumber, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
    // }
    else if (user.currentSearch === "search_term") {
        user.searchTerm = text;
        await user.save();
        // await vendor.deleteOne({ phoneNumber })
        const imageButtons = [
            { id: "yes", title: "📸 Yes" },
            { id: "no", title: "❌ No" }
        ];
        await sendButtonMessage(phoneNumber, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
    }
    else if (user.currentSearch === "location_request") {
        user.location = text;
        user.currentSearch = "radius_request";
        await user.save();
        await sendTextMessage(phoneNumber, "Great! 👍 Lastly, how far should we search? Enter the radius in kilometers (e.g., 5, 10, etc.). 📏", "0.7");
    }

    else if (user.currentSearch === "radius_request" && !isNaN(Number(text))) {
        const messagingProduct = req.body?.entry?.[0]?.changes?.[0]?.value?.messaging_product;
        const contact = req.body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
        const profileName = contact?.profile?.name ?? "Unknown User"; // Fallback
        console.log("MDG_PRODUCT", messagingProduct)
        try {
            await User.findOneAndUpdate(
                { phoneNumber }, // Find user by phone number
                { registrationSource: String(messagingProduct) }, // Update lastMessage field
                { upsert: true, new: true } // Agar user nahi mila to create kar do
            );

            // if (!user) { // Check if user doesn't exist OR user has no name
            // ✅ Extract Contact Information (Safely)

            // const waId = contact?.wa_id ?? phoneNumber; // Fallback
            // console.log("📞 Extracted Contact:", waId, "👤 Name:", profileName);

            // ✅ Create or Update User with Name
            // if (!user) {
            //          new User({
            //         phoneNumber: waId, // Save the phoneNumber number
            //         name: profileName,  // WhatsApp name
            //         currentSearch: null,
            //         location: null,
            //         radius: Number(text), // Save the radius
            //         registrationSource: String(messagingProduct),
            //     });
            // }
            // else {
            //     user.name = profileName;
            //     user.phoneNumber = waId;
            //     user.radius = Number(text);
            //     user.registrationSource = String(messagingProduct);
            // }

            // await user.save();

            // console.log("✅ User Saved/Updated in MongoDB:", user);

            // ✅ Send Welcome Message
            const buttons = [
                { id: "SearchHistory", title: "Search History" },
                { id: "Coins", title: "Coin" }
            ];
            await sendButtonMessage(phoneNumber, `🚀 Perfect! We’ll notify you as soon as we find the best matches.Welcome, ${profileName} !`, buttons, "0.8");
            // return;  // Stop Further Execution
            const isMatchVendor = await Vendor.findOne({
                shopCategory: { $in: user.searchCategory } // ✅ Check if any searchCategory exists in shopCategory
            });


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

                vendornum = isMatchVendor.phoneNumber;

                await sendButtonMessage(vendornum, `User is searching for ${user.searchTerm} Reply if available ? `, buttons);
            }



            // ✅ Koi Vendor match nahi hua to ye chalega
            else {
                sendTextMessage(user.phoneNumber, "⚠️ No Vendor Found");
            }


        }
        //     else {
        //     // ✅ If User Already Exists and has a Name, Update Only the Radius
        //     user.currentSearch = null;
        //     user.radius = Number(text);
        //     await user.save();
        //     console.log("✅ User Updated with New Radius:", user.radius);

        //     const buttons = [
        //         { id: "SearchHistory", title: "Search History" },
        //         { id: "Coins", title: "Coin" }
        //     ];
        //     await sendButtonMessage(phoneNumber, "🚀 We’ll notify you as soon as we find the best matches. Stay tuned! 🔔", buttons, "0.8");
        //     return;
        // }
        catch (error) {
            console.error("❌ MongoDB Save/Contact Extraction Error:", error);
            await sendTextMessage(phoneNumber, "Oops! Something went wrong. Please try again.", "error");
        }
    }
    else if (user.lastMessage.startsWith("pr_of_prd")) {
        // vendor.temObj.priceSendToUsers = text
        // vendor.save();
        const buttons = [
            { id: "unlock_Price", title: "Unlock to See Price" }
        ];
        const userPhone = vendor.temObj.messageSendToUsers;
        await User.findOneAndUpdate(
            { phoneNumber: userPhone }, // Find user by phone number
            { $set: { "tempObj.priceByVendor": text } }, // Update nested field properly
            { new: true, upsert: true } // Returns updated document & creates if not exists
        );
        await sendButtonMessage(userPhone, "Click unlock to the price of product", buttons, "unl_price")
    }


    // 

    // Vendor registration flow
    else if (text && user.lastMessage.startsWith("reg_vendor_name")) {
        // api hugee hasan ki implement
        console.log("vendor ke naam ke ander", text)
        vendor.vendorFullName = text;
        await vendor.save()

        await sendTextMessage(phoneNumber, " ✅ Got it! Now, what’s the name of your shop? 🏪", "reg_shop_name")
    } else if (text && user.lastMessage.startsWith("reg_shop_name")) {
        // api hugee hasan ki implement
        vendor.shopName = text;
        await vendor.save()
        await sendTextMessage(phoneNumber, "🏠 Please enter your shop's complete address (e.g., Street name, Area, City).", "reg_adress")
    } else if (text && user.lastMessage.startsWith("reg_adress")) {
        // api hugee hasan ki implement
        vendor.address = text;
        await vendor.save()
        await sendTextMessage(phoneNumber, "📍 Great! Now, please share your shop's exact location by sending a pinned location.", "pin_location")
    } else if (user.lastMessage.startsWith("pin_location")) {
        // api hugee hasan ki implement
        vendor.pinLocation.coordinates[0] = longitude;
        vendor.pinLocation.coordinates[1] = latitude;
        await vendor.save()
        await sendTextMessage(phoneNumber, "📸 Thanks! Now, send a clear photo of your shop.", "business_photo")
    } else if (user.lastMessage.startsWith("business_photo")) {
        // 📸 WhatsApp se image ID lo
        const image = messageEntry?.image?.id;
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
        // 📩 List Message bhejna
        await sendListMessage(phoneNumber, "👍 Perfect! Now, choose the categories that best describe your shop. You can select multiple options by sending the numbers separated by commas (e.g., 2,4,3).", "Shopcategory", shopSections, "Shopcategory_selected");

        // 📩 Button Message bhejna (Others Option ke liye)
        await sendButtonMessage(phoneNumber, "Button: Others (Please specify) ✍️", buttons, "Shopcategory_selected");
    }
    res.sendStatus(200);
};



