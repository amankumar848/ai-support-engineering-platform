import User from "../models/User.js";

export const getEngineers = async (req, res) => {
  try {
    const engineers = await User.find({
      role: "engineer"
    }).select("name email");

    res.status(200).json({
      engineers
    });

  } catch (error) {
    console.error("Get engineers error:", error);

    res.status(500).json({
      message: "Failed to fetch engineers"
    });
  }
};