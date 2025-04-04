import Vendor from "../models/Vendor.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { getLocationDetails } from "../utils/geolocation/geoLocation.js";
import Query from "../models/Query.js";
import User from "../models/user.js";
import langData from "../utils/languagesJson/languages.json" with { type: "json" };
import { sendButtonMessage, sendTextMessage } from "../helper/messageHelper.js";
const lang = langData;

// deleteVendor function to delete a vendor shop
export const deleteVendor = async (req, res) => {
    try {
        const deletedVendor = await Vendor.findByIdAndDelete(req.user.id);
        if (!deletedVendor) return res.status(404).json({ message: "Vendor not found" });
        res.json({ message: "Vendor shop deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting vendor shop" });
    }
}
// updateVendor function to update a vendor shop
export const updateVendor = async (req, res) => {
    try {
        const updatedVendor = await Vendor.findByIdAndUpdate(req.user.id, req.body, { new: true });
        if (!updatedVendor) return res.status(404).json({ message: "Vendor not found" });
        res.json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: "Error updating vendor shop" });
    }
}
// vendor history
export const getHistoryVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.id, "responseHistory");
        const query = await Query.find({ vendorId: vendor._id })
        if (!vendor) return res.status(404).json({ message: "Vendor not found" });
        res.json({ responseHistory: query });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving vendor response history" });
    }
}
// vendor login
export const vendorLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    } else {
        try {
            const existingVendor = await Vendor.findOne({ email });
            if (!existingVendor || !(await bcrypt.compare(password, existingVendor.password))) {
                return res.status(401).json({ message: "Invalid credentials" });
            } else if (existingVendor && (await bcrypt.compare(password, existingVendor.password))) {
                const token = jwt.sign({ id: existingVendor._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
                res.cookie("access_token", token, { httpOnly: true, secure: true, sameSite: "strict" });
                res.status(200).json({ message: "Login successful" });
            }
        } catch (error) {
            return res.status(400).json({ error: "Error logging in", error });
        }
    }
}
// vendor sign up
export const vendorSignUp = async (req, res) => {
    const { email, password, phoneNumber, address, shopName, shopCategory, pinLocation, products } = req.body;
    console.log(req.body);
    if (!email || !password || !phoneNumber || !address || !shopName || !shopCategory || !pinLocation) {
        return res.status(400).json({ message: "All fileds are required" });
    }
    try {
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor already exists" });
        } else {
            const hashPassword = await bcrypt.hash(password, 10);
            const lng = pinLocation.coordinates[0]; // Extract latitude first
            const lat = pinLocation.coordinates[1]; // Extract longitude second
            const locationData = await getLocationDetails(lat, lng);
            const newVendor = await Vendor.create({
                email,
                password: hashPassword,
                phoneNumber,
                address,
                shopName,
                shopCategory,
                products,
                pinLocation: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                country: locationData.country,
                city: locationData.city,
                postalCode: locationData.postalCode
            })
            await newVendor.save();
            return res.status(201).json({ message: "Vendor created successfully" });
        }
    } catch (error) {
        res.status(400).json({ error: "Error creating vendor", details: error.message });
    }
}


export const showQuery = async (req, res) => {
    const { queryId } = req.params
    console.log("queryId", queryId)
    if (!queryId) {
        console.log("Params query Id not found")
        return
    }

    const query = await Query.findOne({ queryId: queryId });
    console.log("query", query)
    if (!query) {
        console.log("Query not found")
        return
    }


    const userId = query?.userId;
    const vendorId = query?.vendorId
    console.log("userId", userId)


    // user ki info
    const user = await User.findOne({ _id: userId });
    if (!user) {
        console.log("User not found")
    }
    const userNumber = user?.phoneNumber;
    console.log("userNumber", userNumber);


    // vendor ki info
    const vendor = await Vendor.findOne({ _id: vendorId });
    if (!vendor) {
        console.log("User not found")
    }
    const vendorNumber = vendor?.phoneNumber;
    console.log("vendorNumber", vendorNumber);
    res.status(200).send(query)



}

export const sendpricing = async (req, res) => {
    const { queryId } = req.params
    const { priceReceived } = req.body
    console.log("priceRec", priceReceived)
    console.log("queryId", queryId)
    if (!queryId) {
        console.log("Params query Id not found")
        return
    }

    const query = await Query.findOne({ queryId: queryId });
    console.log("query", query)
    if (!query) {
        console.log("Query not found")
        return
    }

    const userId = query?.userId;
    const vendorId = query?.vendorId

    // user ki info
    const user = await User.findOne({ _id: userId });
    if (!user) {
        console.log("User not found")
    }
    const userNumber = user?.phoneNumber;
    console.log("userNumber", userNumber);


    // vendor ki info
    const vendor = await Vendor.findOne({ _id: vendorId });
    if (!vendor) {
        console.log("User not found")
    }
    const vendorNumber = vendor?.phoneNumber;
    console.log("vendorNumber", vendorNumber);


    const ulang = user.language;

    const updatedQuery = await Query.findOneAndUpdate(
        { queryId: queryId, status: "waiting" }, // ✅ Spelling fix
        { priceByVendor: priceReceived, status: "answered" },
        { new: true }
    );

    console.log("check update query hui", updatedQuery)
    if (!updatedQuery) {
        return await sendTextMessage(userNumber, lang[ulang].QUERY_NOT_FOUND, "error");
    }

    const buttons = [{ id: `view_details|${queryId}`, title: lang[ulang].VIEW_DETAILS }];
    await sendButtonMessage(userNumber, lang[ulang].SEE_VENDOR_DETAILS, buttons);
    await sendTextMessage(vendorNumber, "thanks for submiting req!")
    res.status(200).send({ success: true, message: "your price has been sent" })

}