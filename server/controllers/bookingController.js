import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import stripePackage from "stripe";
import { inngest } from "../inngest/index.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    console.log("Seat Availability Error:", error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check seat availability
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats are not available.",
      });
    }

    // Get show details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.status(404).json({ success: false, message: "Show not found." });
    }

    // Calculate amount
    const amount = showData.showPrice * selectedSeats.length;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount,
      bookedSeats: selectedSeats,
    });

    // Mark seats as occupied
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // Stripe setup
    const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY);

    const line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: showData.movie.title,
          },
          unit_amount: Math.floor(showData.showPrice * 100), // price per seat in cents
        },
        quantity: selectedSeats.length,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings`,
      cancel_url: `${origin}/my-bookings`,
      line_items,
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    booking.paymentLink = session.url;
    await booking.save();

    //Run Inngest function to check payment status after 10 minutes
    await inngest.send({
      name: "app/checkpayment",
      data: { bookingId: booking._id.toString() },
    })

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking.",
      error: error.message,
    });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    if (!showData) {
      return res.status(404).json({ success: false, message: "Show not found." });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.log("Get Occupied Seats Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
