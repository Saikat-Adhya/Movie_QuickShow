import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    const { userId } = req.auth();
    try {
        const user = await clerkClient.users.getUser(userId);
        if (user.privateMetadata.role !== "admin") {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    } catch (error) {
        console.error("Error checking admin status:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};