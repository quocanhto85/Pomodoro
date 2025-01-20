import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const client = await clientPromise;
        const db = client.db("pomodoro_app");
        const userId = "anhtpq";

        // Get today's date at midnight UTC to use as the date key
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const result = await db.collection("pomodoroSessions").updateOne(
            { userId, date: today },
            {
                $inc: { completedCount: 1 },
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() }
            },
            { upsert: true }
        );

        return res.status(200).json({
            message: "Pomodoro session updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Error updating pomodoro session:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}