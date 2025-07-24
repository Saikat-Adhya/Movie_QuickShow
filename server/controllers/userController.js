import Booking from "../models/Booking.js";
import { clerkClient, getAuth } from "@clerk/express";
import Movie from "../models/Movie.js";

// ✅ Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate({ path: "show", populate: { path: "movie" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Favorite Movies
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata.favorites || [];

    const updatedFavorites = favorites.includes(movieId)
      ? favorites.filter((item) => item !== movieId)
      : [...favorites, movieId];

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: { favorites: updatedFavorites },
    });

    res.json({ success: true, message: "Favorite movies updated." });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Favorite Movies
export const getFavorites = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
