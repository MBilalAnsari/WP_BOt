import { sendButtonMessage, sendListMessage, sendLocationMessage, sendPhotoMessage, sendTextMessage, sendImageWithButtons, sendCTAButtonMessage, sendImageWithLink } from "../../../helper/messageHelper.js";
import User from "../../../models/user.js";
import Vendor from "../../../models/Vendor.js";
import Query from "../../../models/Query.js";
import mongoose from "mongoose";
import { query } from "express";
import { uploadWhatsAppImage } from "../../../helper/uploadBusinessPhoto.js";
import { sendMessage } from "../../../services/whatsappService.js";
const { ObjectId } = mongoose.Types;

const categories = [
    { id: "grocery", title: "🛒 Grocery" },
    { id: "clothing", title: "👗👕 Clothing" },
    { id: "electronics", title: "📱💻 Electronics" },
    { id: "salon & Beauty", title: "💇‍♂️💅 Salon & Beauty" },
    { id: "food & Beverages", title: "🍔☕ Food & Beverages" }
];



export const searchItem = async (messageData) => {
    const { phoneNumber, text, btnReply, listReply, lastMessage, image = {}, location, messagingProduct, profileName, s_u_ln, lang, s_v_ln } = messageData;
    const { imageId, sha256, mimeType } = image;

    let user = await User.findOne({ phoneNumber });
    let vendor = await Vendor.findOne({ phoneNumber })
    if (!user && vendor) {
        user.language = vendor.language;
        await user.save();
    } else {
        user.language = user.language
        await user.save();
    }

    if (btnReply === "search_item" || btnReply.toLowerCase() === "continue" && user?.queryMess === "0.1.0") {
        console.log(lang[s_u_ln].SEARCH_MSG);
        await sendTextMessage(phoneNumber, lang[s_u_ln].SEARCH_MSG, "0.1.1", "0.1.0");
    }

    else if ((text && user.lastMessage === "0.1.1") || (btnReply.toLowerCase() === "continue" && user?.queryMess === "0.1.1")) {

        const user = await User.findOne({ phoneNumber })
        const Product = text || user.currentSearch;
        user.currentSearch = Product;

        const queryId = new Date().getTime(); // Unique ID for each query
        const newQuery = {
            queryId,
            userId: user._id,
            vendorId: null, // Send vendor ID one by one
            product: Product,
            status: "waiting"
        };
        console.log(newQuery, "fist query")
        //  Query create karna
        await Query.create(newQuery);
        console.log(`==>> Query saved for user ID: ${user._id}`);
        await user.save()
        console.log("yes or no")
        const imageButtons = [
            { id: "yes", title: lang[s_u_ln].YES },
            { id: "no", title: lang[s_u_ln].NO }
        ];
        const queryID = `0.1.2|${queryId}`
        await sendButtonMessage(phoneNumber, lang[s_u_ln].IMAGE_Q, imageButtons, queryID, "0.1.1");
    }

    else if ((btnReply?.toLowerCase() === "yes" && lastMessage?.startsWith("0.1.2")) || (btnReply.toLowerCase() === "continue" && user?.queryMess === "0.1.2")) {
        console.log(lang[s_u_ln].UPLOAD_MSG);
        const [lastmessage, querId] = lastMessage?.split("|")
        console.log("lastMesSPlitWlaa", lastmessage, querId)

        const queryId = `0.1.3|${querId}`

        await sendTextMessage(phoneNumber, lang[s_u_ln].UPLOAD_MSG, queryId, "0.1.2");
    }

    else if (imageId && lastMessage?.startsWith("0.1.3")) {
        const [lastmessage, queryId] = lastMessage?.split("|")
        console.log("lastMesSPlitWlaa", lastmessage, queryId)
        const image = imageId
        console.log("imageeee id", image)
        if (image) {
            const imageUrl = await uploadWhatsAppImage(imageId, mimeType);
            console.log("Generated Image URL:", imageUrl);

            if (imageUrl) {
                console.log("if ky andar imageURL");

                const updateResult = await User.updateOne(
                    { _id: user._id },
                    { $set: { shopImg: imageUrl } }
                );

                const updateQuery = await Query.updateOne(
                    { queryId: queryId },
                    { $set: { shopImg: imageUrl } }
                );

                console.log("MongoDB Update Result:", updateResult);
                console.log("MongoDB Query Result:", updateQuery);

                if (updateResult.modifiedCount > 0) {
                    await sendTextMessage(phoneNumber, lang[s_u_ln].ITEM_UPLOAD_SUCCESS);
                } else {
                    console.error("Shop Image Update Failed!");
                    await sendTextMessage(phoneNumber, lang[s_u_ln].IMAGE_UPLOAD_FAILED, "0.1.3");
                }
            }
        } else {
            await sendTextMessage(phoneNumber, "lang[s_v_l].NO_IMAGE_FOUND");
        }

        if (categories.length > 3) {
            const categorySections = [{
                title: lang[s_u_ln].CATEGORY_TITLE,
                rows: categories.map(cat => ({ id: cat.id, title: cat.title }))
            }];
            await sendListMessage(phoneNumber, lang[s_u_ln].CHOOSE_CATEGORY, lang[s_u_ln].CATEGORY_NAME, categorySections, "0.1.4", "0.1.3");
        } else {
            await sendButtonMessage(phoneNumber, lang[s_u_ln].CHOOSE_CATEGORY, categories, "0.1.4", "0.1.3");
        }
    }

    else if ((btnReply?.toLowerCase() === "no" && lastMessage?.startsWith("0.1.2")) || (btnReply.toLowerCase() === "continue" && user?.queryMess === "0.1.3")) {
        if (categories.length > 3) {
            const categorySections = [{
                title: lang[s_u_ln].CATEGORY_TITLE,
                rows: categories.map(cat => ({ id: cat.id, title: cat.title }))
            }];
            console.log("catefgories", categorySections);
            await sendListMessage(phoneNumber, lang[s_u_ln].CHOOSE_CATEGORY, lang[s_u_ln].CATEGORY_NAME, categorySections, "0.1.4", "0.1.3");
        } else {
            await sendButtonMessage(phoneNumber, lang[s_u_ln].CHOOSE_CATEGORY, categories, "0.1.4", "0.1.3");
        }
    }

    else if ((categories.some(cat => cat.id.toLowerCase().trim() === listReply.toLowerCase().trim()) && lastMessage === "0.1.4") || (btnReply.toLowerCase() === "continue" && user?.queryMess === "0.1.4")) {
        const selectedCategory = categories.find(cat => cat.id.toLowerCase().trim() === listReply.toLowerCase().trim());
        console.log("selectedList", selectedCategory.id)
        user.searchCategory = selectedCategory.id;
        await user.save();
        await sendLocationMessage(phoneNumber, lang[s_u_ln].LOCATION_MSG, "0.1.5", "0.1.4");
    }

    else if (lastMessage === "0.1.5" || (btnReply.toLowerCase() === "continue" && user?.queryMess === "0.1.5")) {
        console.log("location agai", location);

        if (!location?.latitude || !location?.longitude) {
            console.log(lang[s_u_ln].INVALID_LOCATION);
            await sendTextMessage(phoneNumber, lang[s_u_ln].INVALID_LOCATION, "0.1.5", "0.1.5");
            return;
        }
        const { longitude, latitude } = location;
        user.pinLocation = { type: "Point", coordinates: [longitude, latitude] };
        await user.save();
        await sendTextMessage(phoneNumber, lang[s_u_ln].ENTER_RADIUS, "0.1.6", "0.1.5");
    }

    else if (text && lastMessage === "0.1.6") {
        const isValidRadius = (input) => /^[0-9]+$/.test(input) && Number(input) > 0;
        if (!isValidRadius(text)) {
            await sendTextMessage(phoneNumber, "❌ Invalid radius! Please enter a valid number in kilometers (e.g., 5, 10, etc.).", "0.1.6");
            return;
        }
        const radius = text;
        user.radius = radius;
        await user.save();
        const button = [
            { id: "yeah", title: lang[s_u_ln].YES },
            { id: "nope", title: lang[s_u_ln].NO }
        ];
        await sendButtonMessage(phoneNumber, "Would you like to ask Prodcut Price?", button, "0.1.7", "0.1.6");
    }

    else if ((lastMessage === "0.1.7" && btnReply.startsWith("yeah")) || btnReply.startsWith("nope")) {

        console.log("MDG_PRODUCT", messagingProduct)

        try {
            const user = await User.findOneAndUpdate(
                { phoneNumber },
                {
                    registrationSource: String(messagingProduct),
                },
            );

            const userId = user._id;
            const buttons = [
                { id: "SearchHistory", title: "Search History" },
                { id: "Coins", title: "Coin" }
            ];
            await sendButtonMessage(phoneNumber, `${lang[s_u_ln].MATCH_FOUND} ${profileName}!`, buttons, "0.1.6.1");

            const unansweredQueries = await Query.find({
                vendorId: new mongoose.Types.ObjectId(vendor._id),
                status: "waiting", //  Sirf "waiting" wali queries
                messageSent: true  //  Jo pehle bheji gayi thi
            }).sort({ sentAt: 1 }); //  Purani queries pehle dikhengi

            console.log("🚀 Unanswered Queries:", unansweredQueries);

            if (unansweredQueries.length > 0) {
                //  Sirf `product` ka naam retrieve karo
                let queriesList = unansweredQueries.map(q => `**Product:** ${q.product}`).join("\n");

                //  Vendor ka phone number retrieve karo
                const vendorData = await Vendor.findOne({ _id: vendor._id }).select("phoneNumber language shopImg");
                const vendorPhone = vendorData?.phoneNumber;
                const vlang = vendorData?.language || "en"; // Default "en" rakho agar language na mile
                for (const query of unansweredQueries) {
                    //Har query ka alag message banayenge
                    const message = lang[vlang].QUERY_RESPONSE.replace("{queriesList}", `*Product:* ${query.product}`);

                    const buttonforPrice = [
                        { id: `Yes_avl|${query.queryId}`, title: "Yes" },
                        { id: `No_avl|${query.queryId}`, title: "No" }
                    ];
                    const buttonNotforPrice = [
                        { id: `onlyyes_avl|${query.queryId}`, title: "Yes" },
                        { id: `onlyno_avl|${query.queryId}`, title: "No" }
                    ];

                    if (query.priceAsked) {
                        const createWhatsAppCTAMessage = {
                            phone: vendorPhone,
                            imageUrl: query.shopImg,
                            bodyText: message,
                            footerText: "Thank you for choosing our service.",
                            displayText: "Visit Website",
                            url: `https://whatsapp-responder.vercel.app/#/${query.queryId}`,
                        };
                        const ctaMessage = {
                            header: "Response to user",
                            body: message,
                            displayText: "Click it",
                            url: `https://whatsapp-responder.vercel.app/#/${query.queryId}`,
                            title: "Yes"
                        };
                        console.log(`Price was asked for yes: ${query.priceAsked}`);
                        // Yahan tum priceAsked true hone par kuch bhi logic add kar sakte ho
                        const shopImgavail = query.shopImg && query.shopImg !== "default.jpg";
                        if (shopImgavail) {
                            await sendImageWithLink(createWhatsAppCTAMessage, `0.1.7_${query.queryId}`);
                            // await sendImageWithButtons(vendor?.phoneNumber, query.shopImg, message, buttonforPrice, `0.1.8_${query.queryId}`);
                        } else {
                            // await sendButtonMessage(vendorPhone, message, buttonforPrice, `0.1.8_${query.queryId}`);
                            await sendCTAButtonMessage(vendorPhone, ctaMessage, `0.1.8_${query.queryId}`);

                        }
                    } else {
                        console.log(`Price was NOT asked for No: ${query.priceAsked}`);
                        const shopImgavail = query.shopImg && query.shopImg !== "default.jpg";
                        if (shopImgavail) {
                            await sendImageWithButtons(vendor?.phoneNumber, query.shopImg, message, buttonNotforPrice, `0.1.8_${query.queryId}`);
                        } else {
                            await sendButtonMessage(vendorPhone, message, buttonNotforPrice, `0.1.8_${query.queryId}`);
                        }
                    }
                }
            }
            let searchCriteria = {};
            if (user?.pinLocation?.coordinates[1] && user?.pinLocation?.coordinates[0] && user?.radius) {
                searchCriteria.pinLocation = {
                    $near: {
                        $geometry: { type: "Point", coordinates: [parseFloat(user.pinLocation.coordinates[0]), parseFloat(user.pinLocation.coordinates[1])] },
                        $maxDistance: user.radius * 1000, // Convert km to meters
                    },
                };
            }
            if (user?.searchCategory) {
                searchCriteria.shopCategory = { $in: user.searchCategory };
            }
            if (user?._id) {
                searchCriteria._id = { $ne: user._id.toString() };  // Ensure string match
            }
            // Extra check agar user aur vendor ka `phoneNumber` ya `userId` same ho
            if (user?.phoneNumber) {
                searchCriteria.phoneNumber = { $ne: user.phoneNumber };
            }
            if (user?.userId) {
                searchCriteria.userId = { $ne: user.userId };
            }
            const matchVendors = await Vendor.find(searchCriteria);
            if (matchVendors.length > 0) {
                console.log("==>> Match Found!");

                let vendorDetails = matchVendors.map(vendor => ({
                    id: vendor._id,
                    phoneNumber: vendor.phoneNumber,
                    language: vendor.language
                }));

                console.log(vendorDetails, "vendor details");
                const priceAskedValue = btnReply.startsWith("yeah");
                // Sare vendors ke queries save aur find karne ke liye promise array
                const queryPromises = vendorDetails.map(async (vendor) => {
                    const shopImgValue = user.shopImg || "default.jpg";
                    const existingQuery = await Query.findOneAndUpdate(
                        {
                            $or: [
                                { vendorId: null }, // ✅ Initially vendorId null tha
                                { vendorId: new mongoose.Types.ObjectId(vendor.id) } // ✅ Match with updated vendorId
                            ],
                            userId: new mongoose.Types.ObjectId(userId),
                            product: user.currentSearch,
                            shopImg: shopImgValue,
                            status: "waiting"
                        },
                        {
                            $set: {
                                vendorId: new mongoose.Types.ObjectId(vendor.id), //Update vendorId
                                updatedAt: new Date(),
                                messageSent: true, // Track karo ke message bhej diya gaya
                                sentAt: new Date(), //Track karo ke kab bheja gaya
                                priceAsked: priceAskedValue // Variable use kar diya
                            }
                        },
                        // { new: true, upsert: true }
                    );

                    if (existingQuery) {
                        console.log(`Skipping duplicate query for Vendor ${vendor.id} - Product: ${user.currentSearch}`);
                        return { vendor, pendingQueries: [existingQuery] }; // Sirf existing query return karo
                    }

                    //  Query find karna
                    const pendingQueries = await Query.find({ vendorId: vendor.id, status: "waiting" });

                    return { vendor, pendingQueries }; // ==>> Return both vendor info and pending queries
                });

                // ==>> Sare queries ka result ek saath wait karna
                const allPendingQueries = await Promise.all(queryPromises);

                console.log(allPendingQueries, "queries");

                // ==>> Ab sirf un vendors ko message send karo jinke pending queries hain
                for (const { vendor, pendingQueries } of allPendingQueries) {
                    if (!pendingQueries.length) {
                        console.log(`==>> No pending queries for Vendor ID: ${vendor.id}`);
                        continue;
                    }
                    const validLastMessages = ["0.1.1", "0.1.2", "0.1.4", "0.1.5", "0.1.6", "0.1.7", "0.1.8", "0.1.6.1"];

                    const user = await User.findOne({ phoneNumber: vendor.phoneNumber });
                    const isValidLastMessage = validLastMessages.includes(user.lastMessage);
                    if (btnReply === "yeah") {
                        if (isValidLastMessage) {
                            for (const query of pendingQueries) {
                                console.log("jhn messg jayga agr kisi flow me ho", vendor.phoneNumber)
                                const foundedNumber = vendor.phoneNumber;
                                const vlang = vendor.language;
                                console.log(query, "query")
                                console.log(query.queryId, "query agai")
                                const button = [
                                    { id: `Yes_avl|${query.queryId}`, title: "Yes" },
                                    { id: `No_avl|${query.queryId}`, title: "No" },
                                    { id: "continue", title: "Continue" }
                                ];
                                const shopImgavail = query.shopImg && query.shopImg !== "default.jpg";
                                const ctaMessage = {
                                    header: "Response to user",
                                    body: `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`,
                                    displayText: "Click it",
                                    url: `https://whatsapp-responder.vercel.app/#/${query.queryId}`,
                                    title: "Yes"
                                };
                                const createWhatsAppCTAMessage = {
                                    phone: foundedNumber,
                                    imageUrl: query.shopImg,
                                    bodyText: `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`,
                                    footerText: "Thank you for choosing our service.",
                                    displayText: "Visit Website",
                                    url: `https://whatsapp-responder.vercel.app/#/${query.queryId}`,
                                };
                                if (shopImgavail) {
                                    console.log("if imageavailValidlastMess", foundedNumber)
                                    await sendImageWithLink(createWhatsAppCTAMessage, `0.1.7_${query.queryId}`);
                                    // await sendImageWithButtons(foundedNumber, shopImgavail, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.8_${query.queryId}`);
                                } else {
                                    console.log("if imageNOtavailValidlastMess", foundedNumber)
                                    // await sendButtonMessage(foundedNumber, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.8_${query.queryId}`);
                                    await sendCTAButtonMessage(foundedNumber, ctaMessage, `0.1.8_${query.queryId}`);
                                }
                            }
                        } else {
                            for (const query of pendingQueries) {
                                console.log("Else jhn messg jayga agr kisi flow me ho", vendor.phoneNumber)
                                const foundedNumber = vendor.phoneNumber;
                                const vlang = vendor.language;
                                console.log(query, "query")
                                console.log(query.queryId, "query agai")
                                const shopImgavail = query.shopImg && query.shopImg !== "default.jpg";
                                console.log("shopImgavail", query.shopImg)
                                const button = [
                                    { id: `Yes_avl|${query.queryId}`, title: "Yes" },
                                    { id: `No_avl|${query.queryId}`, title: "No" }
                                ];
                                const ctaMessage = {
                                    header: "Response to user",
                                    body: `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`,
                                    displayText: "Click it",
                                    url: `https://whatsapp-responder.vercel.app/#/${query.queryId}`,
                                    title: "Yes"
                                };
                                const createWhatsAppCTAMessage = {
                                    phone: foundedNumber,
                                    imageUrl: query.shopImg,
                                    bodyText: `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`,
                                    footerText: "Thank you for choosing our service.",
                                    displayText: "Visit Website",
                                    url: `https://whatsapp-responder.vercel.app/#/${query.queryId}`,
                                };

                                if (shopImgavail) {
                                    console.log("Else ifimageavail", foundedNumber)
                                    console.log("createWhatsAppCTAMessage", createWhatsAppCTAMessage)
                                    await sendImageWithLink(createWhatsAppCTAMessage, `0.1.7_${query.queryId}`);
                                    // await sendImageWithButtons(foundedNumber, shopImgavail, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.7_${query.queryId}`);
                                } else {
                                    console.log("Else ifimageNotavail", foundedNumber)
                                    // await sendButtonMessage(foundedNumber, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.7_${query.queryId}`);
                                    await sendCTAButtonMessage(foundedNumber, ctaMessage, `0.1.8_${query.queryId}`);
                                }
                            }
                        }
                    } else if (btnReply === "nope") {
                        if (isValidLastMessage) {
                            for (const query of pendingQueries) {
                                console.log("Else IF jhn messg jayga agr kisi flow me nhiii ho", vendor.phoneNumber)
                                const foundedNumber = vendor.phoneNumber;
                                const vlang = vendor.language;
                                console.log(query, "query")
                                console.log(query.queryId, "query agai")
                                const button = [
                                    { id: `onlyyes_avl|${query.queryId}`, title: "Yes" },
                                    { id: `onlyno_avl|${query.queryId}`, title: "No" },
                                    { id: "continue", title: "Continue" }
                                ];
                                const shopImgavail = query.shopImg && query.shopImg !== "default.jpg";
                                if (shopImgavail) {
                                    await sendImageWithButtons(foundedNumber, shopImgavail, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.8_${query.queryId}`);
                                } else {
                                    await sendButtonMessage(foundedNumber, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.8_${query.queryId}`);
                                }
                            }
                        } else {
                            for (const query of pendingQueries) {
                                console.log("Else if else jhn messg jayga flow me nhii huga", vendor.phoneNumber)
                                const foundedNumber = vendor.phoneNumber;
                                const vlang = vendor.language;
                                console.log(query, "query")
                                console.log(query.queryId, "query agai")
                                const button = [
                                    { id: `onlyyes_avl|${query.queryId}`, title: "Yes" },
                                    { id: `onlyno_avl|${query.queryId}`, title: "No" }
                                ];
                                const shopImgavail = query.shopImg && query.shopImg !== "default.jpg";
                                if (shopImgavail) {
                                    await sendImageWithButtons(foundedNumber, shopImgavail, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.8_${query.queryId}`);
                                } else {
                                    // await sendCTAButtonMessage(foundedNumber, ctaMess, `0.1.8_${query.queryId}`);
                                    await sendButtonMessage(foundedNumber, `${lang[vlang].USER_SEARCHING} ${query.product}. ${lang[vlang].AVAILABILITY_QUESTION}`, button, `0.1.8_${query.queryId}`);

                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("==>> MongoDB Save/Contact Extraction Error:", error);
            await sendTextMessage(phoneNumber, lang[s_u_ln].ERROR_MESSAGE, "error");
        }
    }
    else if (btnReply?.toLowerCase().startsWith("yes_")) {
        console.log("==>> Vendor ne 'Yes' select kiya!");
        const [yes, queryId] = btnReply.split("|");
        console.log(queryId, "agayi beta");

        const query = await Query.findOne({ queryId: queryId, status: "waiting" });
        if (query) {
            console.log(query, "caste query");
            const vendorId = query?.vendorId;
            const vendor = await Vendor.findOne({ _id: vendorId });
            const response = `yes_${queryId}`;
            await handleVendorResponse(vendor?.phoneNumber, queryId, response, s_u_ln, lang, s_v_ln);
        }

        const expiredQuery = await Query.findOne({ queryId: queryId, status: "expired" });
        if (expiredQuery) {
            console.log(expiredQuery, "expired query");
            const vendorId = expiredQuery?.vendorId;
            const vendor = await Vendor.findOne({ _id: vendorId });
            await sendTextMessage(vendor?.phoneNumber, lang[s_u_ln].QUERY_EXPIRED, "0.1.9");
        }
    }


    else if (btnReply?.toLowerCase().startsWith("onlyyes_")) {
        console.log("==>> Price Nh Pochi or Vendor Ny Yes' select kiya!");
        const [yess, queryId] = btnReply.split("|");
        console.log(queryId, "agayi beta");
        const query = await Query.findOne({ queryId: queryId, status: "waiting" });
        const button = [
            { id: `NoYes_avl|${query.queryId}`, title: "Yes" },
            { id: `NoNo_avl|${query.queryId}`, title: "No" }
        ];
        if (query) {
            console.log(query, "caste query");
            const userId = query?.userId;
            const user = await User.findOne({ _id: userId });
            const vendorId = query?.vendorId;
            const vendor = await Vendor.findOne({ _id: vendorId });
            const foundUser = user.phoneNumber;
            const foundVendor = vendor.phoneNumber;
            console.log("==>> Vendor ny reply dedya");
            console.log("==>> User ko Yes bhejwa do");
            await sendTextMessage(foundVendor, "thanks for submiting response")
            await sendTextMessage(foundUser, "Yes available")
        } else {
            console.log("something wend wrong", error.message)
            await sendTextMessage(foundVendor, "something went wrong try again",)
            await sendTextMessage(foundUser, "something went wrong try again")
        }
    }


    else if (btnReply?.toLowerCase().startsWith("onlyno_avl") || btnReply?.toLowerCase().startsWith("no_avl")) {
        console.log("==>> Price Nh Pochi or Vendor Ny No' select kiya!");
        const [yess, queryId] = btnReply.split("|");
        console.log(queryId, "agayi beta");
        const query = await Query.findOne({ queryId: queryId, status: "waiting" });
        if (query) {
            console.log(query, "caste query");
            const userId = query?.userId;
            const user = await User.findOne({ _id: userId });
            const vendorId = query?.vendorId;
            const vendor = await Vendor.findOne({ _id: vendorId });
            const foundUser = user.phoneNumber;
            const foundVendor = vendor.phoneNumber;
            console.log("==>> Vendor ny reply dedya");
            console.log("==>> User ko Yes bhejwa do");
            await sendTextMessage(foundVendor, "thanks for submiting response")
            await sendTextMessage(foundUser, "No available")
        } else {
            console.log("something wend wrong", error.message)
            await sendTextMessage(foundVendor, "something went wrong try again",)
            await sendTextMessage(foundUser, "something went wrong try again")
        }
    }


    else if (text && lastMessage?.startsWith("0.1.9")) {
        console.log("lastmessssssssage", lastMessage);
        const [lastMessagee, recID] = lastMessage.split("_");
        // const [lastmess, vendornum] = lastMessage.split("|");
        // console.log("id , numberofvendor", lastmess, vendornum);
        console.log("rec iDDDDDDDdd", lastMessagee, recID);

        const updatedQuery = await Query.findOneAndUpdate(
            { queryId: recID, status: "waiting" }, // ✅ Spelling fix
            { priceByVendor: text, status: "answered" },
            { new: true }
        );
        console.log("khchjsdakjdhkhsdf", updatedQuery);

        if (!updatedQuery) {
            return await sendTextMessage(phoneNumber, lang[s_u_ln].QUERY_NOT_FOUND, "error");
        }

        const vendorId = updatedQuery?.vendorId;
        const vendor = await Vendor.findOne({ _id: vendorId });
        const vendorPhone = vendor?.phoneNumber;

        const user = updatedQuery.userId;
        const userFound = await User.findOne({ _id: user });
        const userPhone = userFound?.phoneNumber;
        const ulang = userFound.language;
        const buttons = [{ id: `view_details|${recID}`, title: lang[ulang].VIEW_DETAILS }];
        await sendButtonMessage(userPhone, lang[ulang].SEE_VENDOR_DETAILS, buttons);
        await sendTextMessage(vendorPhone, "thanks for submiting req!")
    }

    else if (btnReply.toLowerCase().startsWith("view_details")) {
        console.log("lastmessssssssage", lastMessage);
        const [lastMessagee, recID] = btnReply.split("|");
        console.log("rec iDDDDDDDdd", lastMessagee, recID);

        const query = await Query.findOne({ queryId: recID });
        const userId = query?.userId;
        const userFound = await User.findOne({ _id: userId });

        if (!userFound) return "User not found";

        const vendorId = query.vendorId;
        const vendorDetails = await Vendor.findOne({ _id: vendorId });

        if (!vendorDetails) return "Vendor not found";

        const { pinLocation, address, shopName, shopImg } = vendorDetails;

        if (!query.detailsViewed) {
            if (userFound.coins >= 1) {
                userFound.coins -= 1;
                await userFound.save();
            } else {
                return await sendTextMessage(userFound.phoneNumber, lang[s_u_ln].INSUFFICIENT_COINS, "error");
            }
            query.detailsViewed = true;
            await query.save();
        }
        if (shopImg) {
            await sendPhotoMessage(userFound.phoneNumber, shopImg);
        }
        const buttons = [
            { id: `unlock_contact|${recID}`, title: lang[s_u_ln].UNLOCK_CONTACT },
            { id: `unlock_price|${recID}`, title: lang[s_u_ln].UNLOCK_PRICE }
        ];

        // Google Maps link array se generate ho raha hai
        const mapLink = lang[s_u_ln].MAP_LOCATION[1].replace("{lat}", pinLocation.coordinates[0]).replace("{lng}", pinLocation.coordinates[1]);
        const msg = ` *${lang[s_u_ln].SHOP_NAME}:* ${shopName}\n\n` + ` [${lang[s_u_ln].MAP_LOCATION[0]}](${mapLink})\n` + ` *${lang[s_u_ln].SHOP_ADDRESS}:* ${address}`;

        await sendButtonMessage(userFound.phoneNumber, msg, buttons, "0.1.9.1");
    }

    else if (btnReply?.toLowerCase().startsWith("unlock_contact")) {
        const [one, two] = btnReply.split("|");
        console.log("unlock_contact", one, two);

        const query = await Query.findOne({ queryId: two });
        const userFound = await User.findOne({ _id: query?.userId });

        if (!userFound) return "User not found";

        const vendorDetails = await Vendor.findOne({ _id: query.vendorId });

        if (!vendorDetails) return "Vendor not found";

        if (!query.contactViewed) {
            if (userFound.coins >= 1) {
                userFound.coins -= 1;
                await userFound.save();
            } else {
                return await sendTextMessage(userFound.phoneNumber, lang[s_u_ln].INSUFFICIENT_COINS, "error");
            }
            query.contactViewed = true;
            await query.save();
        }

        await sendTextMessage(userFound.phoneNumber, `${lang[s_u_ln].VENDOR_CONTACT}: ${vendorDetails.phoneNumber}`, "0.1.9.1");
    }

    else if (btnReply?.toLowerCase().startsWith("unlock_price")) {
        const [one, two] = btnReply.split("|");
        console.log("Unlock_price", one, two);

        const query = await Query.findOne({ queryId: two });
        const userFound = await User.findOne({ _id: query?.userId });

        if (!userFound) return "User not found";

        const priceProd = query.priceByVendor;
        if (!priceProd) return await sendTextMessage(userFound.phoneNumber, lang[s_u_ln].PRICE_NOT_FOUND, "error");

        if (!query.priceViewed) {
            if (userFound.coins >= 1) {
                userFound.coins -= 1;
                await userFound.save();
            } else {
                return await sendTextMessage(userFound.phoneNumber, lang[s_u_ln].INSUFFICIENT_COINS, "error");
            }
            query.priceViewed = true;
            await query.save();
        }

        await sendTextMessage(userFound.phoneNumber, `${lang[s_u_ln].VENDOR_PRICE}: ${priceProd}`, "");
    }
}

async function handleVendorResponse(vendorPhone, queryId, response, s_u_ln, lang, s_v_ln,) {
    try {
        const [yes, recID] = response.split("_")
        console.log("checcccccccccckkkk", yes, recID)
        // id = recID
        console.log(" Processing Vendor Response...", queryId);
        //  Pehle check karo ke queryId valid ObjectId hai ya nahi
        let query;
        if (ObjectId.isValid(queryId)) {
            query = await Query.findOne({ _id: new ObjectId(queryId) });
        } else {
            query = await Query.findOne({ queryId: queryId }); // Query by queryId (string)
        }
        if (!query) return console.log("Query not found!");
        const userId = query.userId;
        const vendorId = query.vendorId;
        const user = await User.findOne({ _id: userId });
        const vendor = await Vendor.findOne({ _id: vendorId })
        if (!user || !vendor) return console.log("User or Vendor not found!");
        if (yes.toLowerCase() === "yes") {
            console.log(" Vendor is Available!");
            vendor.lastMessage = `0.1.9_${recID}`;
            await vendor.save();
            const customLastmess = `0.1.9_${recID}`
            await sendTextMessage(vendorPhone, lang[s_v_ln].ASK_PRODUCT_PRICE, customLastmess);
        } else {
            console.log(" Vendor ne 'No' bola!");
            await sendTextMessage(userPhone, lang[s_u_ln].VENDOR_NOT_AVAILABLE_MSG);
        }
    } catch (error) {
        console.error(" Error in handleVendorResponse:", error);
    }
}












