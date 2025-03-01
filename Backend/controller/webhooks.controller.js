import { Webhook } from "svix"
import User from "../models/User.models.js"


// API Cntroller Function to Manage Clerk User With Database
export const clerkWebhooks = async (req, res) => {
    try {
        console.log('Webhook received:', req.body); // Log received payload

        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await whook.verify(req.rawBody, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { data, type } = req.body;
        console.log('Event Type:', type);

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id, // Clerk's unique user ID
                    name: `${data.first_name} ${data.last_name}`, // Combine first and last names
                    email: data.email_addresses[0].email_address, // First email address
                    image: data.image_url, // Profile picture
                    resume: '', // Optional, empty by default
                };
                
                console.log('Creating user:', userData);

                await User.create(userData);
                console.log('User created successfully');
                return res.status(201).json({ message: "User created successfully" });
            }

            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    image: data.image_url,
                };
                console.log('Updating user:', userData);

                await User.findByIdAndUpdate(data.id, userData);
                console.log('User updated successfully');
                return res.status(200).json({ message: "User updated successfully" });
            }

            case 'user.deleted':
                console.log('Deleting user:', data.id);

                await User.findByIdAndDelete(data.id);
                console.log('User deleted successfully');
                return res.status(200).json({ message: "User deleted successfully" });

            default:
                console.log('Unhandled event type:', type);
                return res.status(400).json({ message: "Unhandled webhook event" });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ message: "Webhook Error", success: false, error: error.message });
    }
};

