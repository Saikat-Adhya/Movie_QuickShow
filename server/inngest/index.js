import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
export const inngest = new Inngest({id:"movie-ticket-booking"});

//Inngest functions to save user data in MongoDB

const syncCreation =  inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},

    async({event})=>{
        const {id,first_name,last_name,email_addresses,image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
             name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData); // Create a new user document in MongoDB
        // Save user data to MongoDB
    }
)

//Inngest functions to delete user data in MongoDB
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event}) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id); // Delete the user document from MongoDB
    }
)

// Inngest functions to update user data in MongoDB
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-with-clerk'},
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        };
        await User.findByIdAndUpdate(id, userData); // Update the user document in MongoDB
    }
)

//Inngest functions to cancel booking and relased seats of show after 10 minutes of booking created if payment is not done

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: 'release-seats-and-delete-booking' },
  { event: 'app/checkpayment' },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

    await step.run('check-payment-status', async () => {
      const bookingId = event.data.bookingId;

      const booking = await Booking.findById(bookingId);

      // If booking is not paid, release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified('occupiedSeats');
        await show.save(); // Save the updated show document to release seats
        await Booking.findByIdAndDelete(booking._id); // Delete the booking document from MongoDB
      }
    });
  }
);


export const functions = [syncCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking];