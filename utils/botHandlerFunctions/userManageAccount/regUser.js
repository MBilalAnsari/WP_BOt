// import { sendButtonMessage, sendListMessage, sendTextMessage, sendPhotoMessage } from "../../../helper/messageHelper.js";
// import { topFunctionHandler } from "../../../helper/topFunction.js";
// import Query from "../../../models/Query.js";

// export const regUser = async (messageData) => {
//     const {
//         phoneNumber,
//         text,
//         btnReply,
//         listReply,
//         lastMessage,
//         image = {},
//         location,
//         messagingProduct,
//         profileName,
//         user,
//         vlastMessage,
//         vendor,
//         s_v_ln,
//         s_u_ln,
//         lang,
//         selectedLang
//     } = messageData;

//     if (["manage_acc_user"].includes(btnReply)) {
//         console.log("account_settings_user wali condition TRUE");
//         const manageAccountButtons = [
//             { id: "user_overview", title: lang[selectedLang].USER_ACC_OVERVIEW },
//             { id: "user_account_update", title: lang[selectedLang].USER_ACC_UPDATE },
//             { id: "user_history", title: lang[selectedLang].USER_ACC_HISTORY },
//         ];
//         await sendButtonMessage(phoneNumber, lang[selectedLang].ACC_USER_OPTION, manageAccountButtons, "0.5.1");
//     }
//     // For user overview
//     else if (["user_overview"].includes(btnReply) && lastMessage?.startsWith("0.5.1")) {
//         console.log("user_overview wali condition TRUE");
//         if (user) {
//             await sendTextMessage(phoneNumber, `👤 ${lang[selectedLang].USER_ACC_OVERVIEW}
//         \n👤 Name: ${messageData.profileName}
//         \n📱 Phone: ${user.phoneNumber}
//         \n💰 Coins: ${user.coins}`);
//         }
//     }
//     // For user history update
//     else if (["user_history"].includes(String(btnReply)) && lastMessage?.startsWith("0.5.1")) {
//         if (user) {
//             const page = user.historyPage || 1;
//             const limit = 5;
//             const skip = (page - 1) * limit;

//             const query = await Query.find({ userId: user._id })
//                 .sort({ createdAt: -1 })
//                 .skip(skip)
//                 .limit(limit + 1);
 
//             console.log(query);

//             if (query.length > 0) {
//                 const displayQueries = query.slice(0, limit);

//                 for (const q of displayQueries) {
//                     await sendTextMessage(
//                         phoneNumber,
//                         `🔍 ${lang[selectedLang].USER_ACC_HISTORY}
//                     \n📅 Date: ${q.createdAt}
//                     \n🔍 Product: ${q.product}
//                     \n💰 Price: ${q.priceByVendor || "Vendor not replied"}`
//                     );
//                 }

//                 if (query.length > limit) {
//                     const buttons = [{ id: "SeeMore", title: "See More" }];

//                     await sendButtonMessage(phoneNumber, lang[selectedLang].USER_HISTORY_LOAD_MORE, buttons, "see_more");

//                     await User.updateOne({ _id: user._id }, { $set: { historyPage: page + 1 } });
//                 }
//             } else {
//                 await sendTextMessage(phoneNumber, lang[selectedLang].USER_HISTORY_EMPTY);
//             }
//         } else {
//             await sendTextMessage(phoneNumber, lang[selectedLang].USER_NOT_FOUND_ERROR);
//         }
//     }
//     // For user account update
//     else if (["user_account_update"].includes(btnReply) && lastMessage?.startsWith("0.5.1")) {
//         const accountUpdateButtons = [
//             { id: "user_name_update", title: lang[selectedLang].USER_NAME_CHANGE },
//             { id: "user_phone_update", title: lang[selectedLang].USER_PHONE_CHANGE },
//             { id: "user_email_update", title: lang[selectedLang].USER_EMAIL_CHANGE },
//         ];
//         await sendButtonMessage(phoneNumber, lang[selectedLang].USER_ACC_UPDATE, accountUpdateButtons, "0.5.2");
//     }
//     // For user name update
//     else if (["user_name_update"].includes(btnReply) && lastMessage?.startsWith("0.5.2")) {
//         await sendTextMessage(phoneNumber, lang[selectedLang].PROMPT_NEW_NAME);
//     }
//     // For user phone update
//     else if (["user_phone_update"].includes(btnReply) && lastMessage?.startsWith("0.5.2")) {
//         await sendTextMessage(phoneNumber, lang[selectedLang].PROMPT_NEW_PHONE);
//     }
//     // For user email update
//     else if (["user_email_update"].includes(btnReply) && lastMessage?.startsWith("0.5.2")) {
//         await sendTextMessage(phoneNumber, lang[selectedLang].PROMPT_NEW_EMAIL);
//     } else {
//         await topFunctionHandler(messageData, sendButtonMessage, true)
//     }
// }