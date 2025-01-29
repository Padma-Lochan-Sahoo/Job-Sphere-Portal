import { Webhook } from "svix"
import User from "../models/User.models.js"


// API Cntroller Function to Manage Clerk User With Database
export const clerkWebhooks = async (req,res) => {
    try {
        
        // Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        // verifying Headers
        await whook.verify(JSON.stringify(req.body),{
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        })

        // Getting data from request body
        const { data , type } = req.body

        // Switch case for different events
        switch (type) {
            case 'user.created':{
                // Creating a new user in database
                const userData = {
                    _id:data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                    resume: ''
                }

                await User.create(userData)
                res
                .status(200)
                .json({
                    message: "User created successfully"
                })
                break;
            }
                

            case 'user.updated':
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    image: data.image_url,
                }
                await User.findByIdAndUpdate(data.id , userData)
                res
                .status(200)
                .json({
                    message: "User updated successfully"
                })
                break;
            case 'user.deleted':
                await User.findByIdAndDelete(data.id)
                res
                .status(200)
                .json({
                    message: "User deleted successfully"
                })
                break;
        
            default:
                break;
        }

    } catch (error) {
        console.log(error);
        res
        .json({
            message: "Webhooks Error",
            success: false
        })
        
    }
}