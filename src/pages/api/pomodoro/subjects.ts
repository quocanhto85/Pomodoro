import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

const DEFAULT_SUBJECT = "General";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const client = await clientPromise;
        const db = client.db("pomodoro_app");
        const userId = "anhtpq";

        // Get distinct subjects the user has studied, treating null as "General"
        const subjectsRaw = await db.collection("pomodoroSessions").aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: { $ifNull: ["$subject", DEFAULT_SUBJECT] },
                    totalPomodoros: { $sum: "$completedCount" },
                    lastUsed: { $max: "$updatedAt" }
                }
            },
            { $sort: { lastUsed: -1 } }
        ]).toArray();

        const subjects = subjectsRaw.map(s => ({
            name: s._id as string,
            totalPomodoros: s.totalPomodoros as number,
            lastUsed: s.lastUsed
        }));

        return res.status(200).json({
            message: "Subjects retrieved successfully",
            data: subjects
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
