import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

/**
 * One-time fix: rename "AI" → "🧬 AI" and "Mathematics" → "📊 Mathematics"
 * for all documents missing the emoji prefix.
 * 
 * Usage: POST /api/pomodoro/seed-subjects
 */
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
        const collection = db.collection("pomodoroSessions");

        const aiResult = await collection.updateMany(
            { subject: "AI" },
            { $set: { subject: "🧬 AI" } }
        );

        const mathResult = await collection.updateMany(
            { subject: "Mathematics" },
            { $set: { subject: "📊 Mathematics" } }
        );

        return res.status(200).json({
            message: "Subject rename completed",
            ai: aiResult.modifiedCount,
            mathematics: mathResult.modifiedCount
        });
    } catch (error) {
        console.error("Seed error:", error);
        return res.status(500).json({ message: "Seeding failed", error: String(error) });
    }
}
