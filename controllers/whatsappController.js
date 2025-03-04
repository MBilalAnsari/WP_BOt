const User = require("../models/user");
const { sendTextMessage, sendButtonMessage, sendListMessage } = require("../helper/messageHelper");
const { sendMessage } = require("../services/whatsappService");

// const handleIncomingMessage = async (req, res) => {
//     console.log("📥 Incoming Request:", JSON.stringify(req.body, null, 2));

//     const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//     if (!messageEntry) return res.sendStatus(400);

//     const phone = messageEntry.from;
//     const text = messageEntry.text?.body?.trim().toLowerCase();
//     console.log("📞 Phone:", phone, "💬 Text:", text);

//     let user = await User.findOne({ phone });
//     if (!user) {
//         user = new User({ phone, lastMessage: "", language: null, currentSearch: null, location: null });
//         await user.save();
//     }

//     if (text === "hi") {
//         user.language = null;
//         user.currentSearch = null;
//         await user.save();

//         const languageButtons = [
//             { id: "eng", title: "🇬🇧 English" },
//             { id: "roman", title: "🇵🇰 Roman Urdu" },
//             { id: "urdu", title: "🏴 Urdu" }
//         ];
//         await sendButtonMessage(phone, "Hey there! 👋 Welcome! Before we get started, please choose your preferred language. 🌍", languageButtons, "0.1");
//     }

//     else if (messageEntry?.type === "interactive" && messageEntry?.interactive?.type === "button_reply") {
//         const buttonId = messageEntry.interactive.button_reply.id.toLowerCase();

//         if (["eng", "roman", "urdu"].includes(buttonId)) {
//             user.language = buttonId;
//             await user.save();
//             await sendTextMessage(phone, "✅ Great! Thanks for confirming. Now, tell me—what are you looking for today? 🔎", "0.2");
//         }

//         else if (buttonId === "yes") {
//             user.currentSearch = "awaiting_image";
//             await user.save();
//             await sendTextMessage(phone, "Awesome! 🎉 Please upload the image.", "0.7");
//         }

//         else if (buttonId === "no") {
//             const categoryButtons = [
//                 { id: "mobile_accessories", title: "📱 Mobile Accessories" },
//                 { id: "mobile_parts", title: "🔧 Mobile Parts" },
//                 { id: "others", title: "🛍️ Others" }
//             ];
//             await sendButtonMessage(phone, "No worries! 😊 To narrow it down, please select the category that best fits your search.", categoryButtons, "0.8");
//         }

//         else if (["mobile_accessories", "mobile_parts", "others"].includes(buttonId)) {
//             user.lastMessage = buttonId;
//             user.currentSearch = "location_request";
//             await user.save();
//             await sendTextMessage(phone, "Thanks! 🙌 Now, could you share your pin location so we can find options near you? 📍", "0.5");
//         }
//     }

//     else if (user.currentSearch === "search_term") {
//         user.searchTerm = text;
//         await user.save();

//         const imageButtons = [
//             { id: "yes", title: "📸 Yes" },
//             { id: "no", title: "❌ No" }
//         ];
//         await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
//     }

//     else if (user.currentSearch === "location_request") {
//         user.location = text;
//         user.currentSearch = "radius_request";
//         await user.save();
//         await sendTextMessage(phone, "Great! 👍 Lastly, how far should we search? Enter the radius in kilometers (e.g., 5, 10, etc.). 📏", "0.7");
//     }

//     else if (user.currentSearch === "radius_request" && !isNaN(Number(text))) {
//         user.currentSearch = null;
//         user.radius = Number(text);
//         await user.save();
//         await sendTextMessage(phone, "Perfect! 🚀 We're on it. We’ll notify you as soon as we find the best matches. Stay tuned! 🔔", "0.8");
//     }

//     else if (text.includes("display")) {
//         user.currentSearch = "search_term";
//         user.searchTerm = text;
//         await user.save();

//         const imageButtons = [
//             { id: "yes", title: "📸 Yes" },
//             { id: "no", title: "❌ No" }
//         ];
//         await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
//     }

//     res.sendStatus(200);
// };

// const categories = [
//     { id: "mobile_accessories", title: "📱 Mobile Accessories" },
//     { id: "mobile_parts", title: "🔧 Mobile Parts" },
//     { id: "others", title: "🛍️ Others" },
//     { id: "special_category", title: "⭐ Special Items" } // Example, this makes it 4+ categories
// ];

// const handleIncomingMessage = async (req, res) => {
//     // console.log("📥 Incoming Request:", JSON.stringify(req.body, null, 2));

//     const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//     if (!messageEntry) return res.sendStatus(400);

//     const phone = messageEntry.from;
//     const text = messageEntry.text?.body?.trim().toLowerCase();
//     console.log("📞 Phone:", phone, "💬 Text:", text);

//     let user = await User.findOne({ phone });


//     // if (!user) { 
//     //     user = new User({ phone, lastMessage: "", language: null, currentSearch: null, location: null });
//     //     await user.save();
//     // }

//     if (!user) { 
//         user = new User({ phone, lastMessage: "", language: null, currentSearch: null, location: null });
//         await user.save();
//         const registerButton = [{id:"register", title:"Register"}];
//         await sendButtonMessage(phone, "Please register first.", registerButton, "0.register.prompt");
//         return res.sendStatus(200);
//     }


//     if (text === "hi") {
//         user.language = null;
//         user.currentSearch = null;
//         await user.save();

//         const languageButtons = [
//             { id: "eng", title: "🇬🇧 English" },
//             { id: "roman", title: "🇵🇰 Roman Urdu" },
//             { id: "urdu", title: "🏴 Urdu" }
//         ];
//         await sendButtonMessage(phone, "Hey there! 👋 Welcome! Before we get started, please choose your preferred language. 🌍", languageButtons, "0.1");
//     }



//     else if (messageEntry?.type === "interactive" && (messageEntry?.interactive?.type === "button_reply" || messageEntry?.interactive?.type === "list_reply")) {
//         let interactiveId;
//         if (messageEntry?.interactive?.type === "button_reply") {
//             interactiveId = messageEntry.interactive.button_reply.id.toLowerCase();
//         } else if (messageEntry?.interactive?.type === "list_reply") {
//             interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();
//         }

//         if (["eng", "roman", "urdu"].includes(interactiveId)) {
//             user.language = interactiveId;
//             await user.save();
//             await sendTextMessage(phone, "✅ Great! Thanks for confirming. Now, tell me—what are you looking for today? 🔎", "0.2");
//         }

//         else if (interactiveId === "yes") {
//             user.currentSearch = "awaiting_image";
//             await user.save();
//             await sendTextMessage(phone, "Awesome! 🎉 Please upload the image.", "0.7");
//         }

//         else if (interactiveId === "no") {
//             if (categories.length > 3) {
//                 const categorySections = [{
//                     title: "Select a Category",
//                     rows: categories.map(cat => ({ id: cat.id, title: cat.title }))
//                 }];
//                 await sendListMessage(phone, "No worries! 😊 Choose a category:", "Categories", categorySections, "0.8");
//             } else {
//                 await sendButtonMessage(phone, "No worries! 😊 Choose a category:", categories, "0.8");
//             }
//         }

//         console.log("Checking categories:", categories.some(cat => cat.id === interactiveId));
//         if (categories.some(cat => cat.id === interactiveId)) {
//             user.lastMessage = interactiveId;
//             user.currentSearch = "location_request";
//             await user.save();
//             await sendTextMessage(phone, "Thanks! 🙌 Now, could you share your pin location so we can find options near you? 📍", "0.5");
//         }

//     }

//     else if (user.currentSearch === "search_term") {
//         user.searchTerm = text;
//         await user.save();

//         const imageButtons = [
//             { id: "yes", title: "📸 Yes" },
//             { id: "no", title: "❌ No" }
//         ];
//         await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
//     }

//     else if (user.currentSearch === "location_request") {
//         user.location = text;
//         user.currentSearch = "radius_request";
//         await user.save();
//         await sendTextMessage(phone, "Great! 👍 Lastly, how far should we search? Enter the radius in kilometers (e.g., 5, 10, etc.). 📏", "0.7");
//     }

//     else if (user.currentSearch === "radius_request" && !isNaN(Number(text))) {
//         user.currentSearch = null;
//         user.radius = Number(text);
//         await user.save();
//         await sendTextMessage(phone, "Perfect! 🚀 We're on it. We’ll notify you as soon as we find the best matches. Stay tuned! 🔔", "0.8");
//     }

//     else if (text.includes("display")) {
//         user.currentSearch = "search_term";
//         user.searchTerm = text;
//         await user.save();

//         const imageButtons = [
//             { id: "yes", title: "📸 Yes" },
//             { id: "no", title: "❌ No" }
//         ];
//         await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
//     }

//     res.sendStatus(200);
// };

const categories = [
    { id: "mobile_accessories", title: "📱 Mobile Accessories" },
    { id: "mobile_parts", title: "🔧 Mobile Parts" },
    { id: "others", title: "🛍️ Others" },
    { id: "special_category", title: "⭐ Special Items" } // Example, this makes it 4+ categories
];
const shopCategory = [
    { id: "grocery", title: "🛒 Grocery" },
    { id: "clothing", title: "👗👕 Clothing" },
    { id: "electronics", title: "📱💻 Electronics" },
    { id: "salon_beauty", title: "💇‍♂️💅 Salon & Beauty" },
    { id: "food_beverages", title: "🍔☕ Food & Beverages" }
];

const handleIncomingMessage = async (req, res) => {
    // console.log("📥 Incoming Request:", JSON.stringify(req.body, null, 2));
    // const messagingProduct = req.body?.entry?.[0]?.changes?.[0]?.value?.messaging_product;
    // console.log("MDG_PRODUCT", messagingProduct)

    const messageEntry = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    // const interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();
    if (!messageEntry) return res.sendStatus(400);

    const phone = messageEntry.from;
    const text = messageEntry.text?.body?.trim().toLowerCase();
    console.log("📞 Phone:", phone, "💬 Text:", text);

    let user = await User.findOne({ phone });

    if (!user) {

        user = new User({ phone, lastMessage: "", language: null, currentSearch: null, location: null });
        await user.save();
    }


    if (text === "hi") {

        user.language = null;
        user.currentSearch = null;
        await user.save();

        const languageButtons = [
            { id: "eng", title: "🇬🇧 English" },
            { id: "roman", title: "🇵🇰 Roman Urdu" },
            { id: "urdu", title: "🏴 Urdu" }
        ];
        await sendButtonMessage(phone, "Hey there! 👋 Welcome! Before we get started, please choose your preferred language. 🌍", languageButtons, "0.1");
    }

    else if (messageEntry?.type === "interactive" && (messageEntry?.interactive?.type === "button_reply" || messageEntry?.interactive?.type === "list_reply")) {

        let interactiveId;
        if (messageEntry?.interactive?.type === "button_reply") {
            interactiveId = messageEntry.interactive.button_reply.id.toLowerCase();
        } else if (messageEntry?.interactive?.type === "list_reply") {
            interactiveId = messageEntry.interactive.list_reply.id.toLowerCase();
        }

        if (["eng", "roman", "urdu"].includes(interactiveId)) {
            user.language = interactiveId;
            await user.save();

            // ✅ Show Main Menu Buttons
            const mainMenuButtons = [
                { id: "search_item", title: "🔍 Search Item" },
                { id: "manage_account", title: "⚙️ Manage Account" },
                { id: "register_shop", title: "🤝 Register Shop" }
            ];

            await sendButtonMessage(phone, "✅ Language selected! Please choose an option below:", mainMenuButtons, "0.3");
        }
        // ✅ If user selects "Search Item"
        else if (interactiveId === "search_item") {
            user.currentSearch = "search_term";
            await user.save();
            await sendTextMessage(phone, "✅ Great! Thanks for confirming. Now, tell me—what are you looking for today? 🔎", "0.4");
        }
        // ✅ Handle "Manage Account"
        else if (interactiveId === "manage_account") {
            await sendTextMessage(phone, "⚙️ Manage Account options are coming soon!", "0.5");
        }
        // ✅ Handle "Register Shop"
        else if (interactiveId === "register_shop") {
            await sendTextMessage(phone, "✅ Great! Thanks for confirming. Now, let’s get you registered as a vendor. This will just take a few minutes. ⏳", "reg_vendor_name");
            await sendTextMessage(phone, " 📝 First, please share your full name.", "reg_vendor_name");
        }
        else if (interactiveId === "yes") {
            user.currentSearch = "awaiting_image";
            await user.save();
            await sendTextMessage(phone, "Awesome! 🎉 Please upload the image.", "0.7");
        }
        else if (interactiveId === "no") {
            if (categories.length > 3) {
                const categorySections = [{
                    title: "Select a Category",
                    rows: categories.map(cat => ({ id: cat.id, title: cat.title }))
                }];
                await sendListMessage(phone, "No worries! 😊 Choose a category:", "Categories", categorySections, "0.8");
            } else {
                await sendButtonMessage(phone, "No worries! 😊 Choose a category:", categories, "0.8");
            }
        }
        if (categories.some(cat => cat.id === interactiveId)) {
            user.lastMessage = interactiveId;
            user.currentSearch = "location_request";
            await user.save();
            await sendTextMessage(phone, "Thanks! 🙌 Now, could you share your pin location so we can find options near you? 📍", "0.5");
        }
    }

    else if (user.currentSearch === "search_term") {
        user.searchTerm = text;
        await user.save();

        const imageButtons = [
            { id: "yes", title: "📸 Yes" },
            { id: "no", title: "❌ No" }
        ];
        await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
    }

    else if (user.currentSearch === "location_request") {
        user.location = text;
        user.currentSearch = "radius_request";
        await user.save();
        await sendTextMessage(phone, "Great! 👍 Lastly, how far should we search? Enter the radius in kilometers (e.g., 5, 10, etc.). 📏", "0.7");
    }
    else if (user.currentSearch === "radius_request" && !isNaN(Number(text))) {
        const messagingProduct = req.body?.entry?.[0]?.changes?.[0]?.value?.messaging_product;
        console.log("MDG_PRODUCT", messagingProduct)
        try {
            if (!user || !user.name) { // Check if user doesn't exist OR user has no name
                // ✅ Extract Contact Information (Safely)
                const contact = req.body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
                const profileName = contact?.profile?.name ?? "Unknown User"; // Fallback
                const waId = contact?.wa_id ?? phone; // Fallback
                console.log("📞 Extracted Contact:", waId, "👤 Name:", profileName);

                // ✅ Create or Update User with Name
                if (!user) {
                    user = new User({
                        phone: waId, // Save the phone number
                        name: profileName,  // WhatsApp name
                        currentSearch: null,
                        location: null,
                        radius: Number(text), // Save the radius
                        registrationSource: String(messagingProduct),
                    });
                } else {
                    user.name = profileName;
                    user.phone = waId;
                    user.radius = Number(text);
                    user.registrationSource = String(messagingProduct);
                }

                await user.save();
                console.log("✅ User Saved/Updated in MongoDB:", user);

                // ✅ Send Welcome Message
                const buttons = [
                    { id: "SearchHistory", title: "Search History" },
                    { id: "Coins", title: "Coin" }
                ];
                await sendButtonMessage(phone, `🚀 Perfect! We’ll notify you as soon as we find the best matches. Welcome, ${profileName}!`, buttons, "0.8");
                return;  // Stop Further Execution
            } else {
                // ✅ If User Already Exists and has a Name, Update Only the Radius
                user.currentSearch = null;
                user.radius = Number(text);
                await user.save();
                console.log("✅ User Updated with New Radius:", user.radius);

                const buttons = [
                    { id: "SearchHistory", title: "Search History" },
                    { id: "Coins", title: "Coin" }
                ];
                await sendButtonMessage(phone, "🚀 We’ll notify you as soon as we find the best matches. Stay tuned! 🔔", buttons, "0.8");
                return;
            }
        } catch (error) {
            console.error("❌ MongoDB Save/Contact Extraction Error:", error);
            await sendTextMessage(phone, "Oops! Something went wrong. Please try again.", "error");
        }
    }
    // else if (text.includes("display")) {
    //     user.currentSearch = "search_term";
    //     user.searchTerm = text;
    //     await user.save();

    //     const imageButtons = [
    //         { id: "yes", title: "📸 Yes" },
    //         { id: "no", title: "❌ No" }
    //     ];
    //     await sendButtonMessage(phone, "Got it! 📱 Would you like to attach a reference image to help us find the best match? 🖼️", imageButtons, "0.6");
    // }

    // Vendor registration flow
    else if (text && user.lastMessage.startsWith("reg_vendor_name")) {
        // api hugee hasan ki implement
        await sendTextMessage(phone, " ✅ Got it! Now, what’s the name of your shop? 🏪", "reg_shop_name")
    } else if (text && user.lastMessage.startsWith("reg_shop_name")) {
        // api hugee hasan ki implement
        await sendTextMessage(phone, "🏠 Please enter your shop's complete address (e.g., Street name, Area, City).", "reg_adress")
    } else if (text && user.lastMessage.startsWith("reg_adress")) {
        // api hugee hasan ki implement
        await sendTextMessage(phone, "📍 Great! Now, please share your shop's exact location by sending a pinned location.", "pin_location")
    } else if (user.lastMessage.startsWith("pin_location")) {
        // api hugee hasan ki implement
        await sendTextMessage(phone, "📸 Thanks! Now, send a clear photo of your shop.", "business_photo")
    }  else if (user.lastMessage.startsWith("business_photo")) {
        if (user.lastMessage.startsWith("business_photo")){
            const buttons = [{id: "Others" , title: "other"}];
            const shopSections = [{
                title: "Select a Category",
                rows: shopCategory.map(shop => ({ id: shop.id, title: shop.title }))
            }];
            await sendListMessage(phone, "👍 Perfect! Now, choose the categories that best describe your shop. You can select multiple options by sending the numbers separated by commas (e.g., 2,4,3).", "Shopcategory", shopSections, "0.8");
            await sendButtonMessage(phone , "Button: Others (Please specify) ✍️" , buttons , "Specify_Others" )
        }
    }

    res.sendStatus(200);
};


module.exports = { handleIncomingMessage };

