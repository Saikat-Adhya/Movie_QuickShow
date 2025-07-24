import { Inngest } from "inngest";
import User from "../models/User.js";

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
export const functions = [syncCreation, syncUserDeletion, syncUserUpdation];