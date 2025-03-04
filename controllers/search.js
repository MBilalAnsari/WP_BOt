import vendor from "../models/Vendor.js";
import User from "../models/User.js";

export const search = async (req, res) => {
    const { query, latitude, longitude, radius } = req.body;
    console.log(query,latitude,longitude,radius, "req.body")
    const userId = req.user.id;

    if (!query) return res.status(400).json({ message: "Search query is required" });

    try {
        let searchCriteria = { products: { $regex: query, $options: "i" } };

        // If location-based search is requested
        if (latitude && longitude && radius) {
            searchCriteria.pinLocation = {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
                },
            };
        }

        const vendors = await vendor.find(searchCriteria, "shopName shopCategory shopImg");

        // Fetch user data once
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if search history already contains this query
        const alreadySearched = user.searchHistory.some(item => item.query.toLowerCase() === query.toLowerCase());

        if (!alreadySearched) {
            user.searchHistory.push({ query });
            await user.save(); // Directly save instead of separate update query
        }

        res.json(vendors);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Error searching vendors", error: error.message });
    }
};

export const openShop = async (req, res) => {
    const userId = req.user.id;
    const { vendorId } = req.params;
    console.log(userId, vendorId)

    try {
        const userFound = await User.findById(userId);
        if (!userFound) return res.status(404).json({ message: "User not found" });

        if (userFound.coins < 1) {
            return res.status(400).json({ message: "Insufficient coins" });
        }

        userFound.coins -= 1;
        await userFound.save();

        const vendorHistory = await vendor.findByIdAndUpdate(vendorId, {
            $push: { responseHistory: { userId, action: "User viewed shop" } }
          }, { new: true });
          console.log(vendorHistory);

        const vendorFound = await vendor.findById(vendorId);
        if (!vendorFound) return res.status(404).json({ message: "Vendor not found" });
        res.json(vendorFound);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving vendor details" });
    }
}