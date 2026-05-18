import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

const DEFAULT_SUBJECT = "General";

/** Subjects stored here stay in DB session history but are omitted from the picker list. */
const SUBJECT_PICKER_HIDDEN_COLLECTION = "subjectPickerHidden";

/**
 * One-off hidden names per user (idempotent upserts).
 * Matches hardcoded MVP user id used elsewhere (`incrementPomo`, GET subjects).
 */
const PICKER_HIDDEN_SEED_BY_USER: Record<string, readonly string[]> = {
    anhtpq: ["💼 Work (Savvy - Salesforce)"],
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db("pomodoro_app");
        const userId = "anhtpq";

        if (req.method === "POST") {
            const subjectName = typeof req.body.subjectName === "string"
                ? req.body.subjectName.trim()
                : "";
            if (!subjectName || subjectName === DEFAULT_SUBJECT) {
                return res.status(400).json({ message: "Invalid subject name" });
            }

            await db.collection(SUBJECT_PICKER_HIDDEN_COLLECTION).createIndex(
                { userId: 1, subjectName: 1 },
                { unique: true, name: "userId_subjectName_hidden_unique" }
            ).catch(() => { /* already exists */ });

            await db.collection(SUBJECT_PICKER_HIDDEN_COLLECTION).updateOne(
                { userId, subjectName },
                {
                    $set: { updatedAt: new Date() },
                    $setOnInsert: {
                        userId,
                        subjectName,
                        createdAt: new Date(),
                    },
                },
                { upsert: true },
            );

            return res.status(200).json({ message: "Subject hidden from picker" });
        }

        if (req.method !== "GET") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        const hiddenDocs = await db.collection(SUBJECT_PICKER_HIDDEN_COLLECTION)
            .find({ userId })
            .project<{ subjectName: string }>({ subjectName: 1, _id: 0 })
            .toArray();
        const hiddenSet = new Set(hiddenDocs.map(d => d.subjectName));

        const seedNames = PICKER_HIDDEN_SEED_BY_USER[userId];
        if (seedNames?.length) {
            await db.collection(SUBJECT_PICKER_HIDDEN_COLLECTION).createIndex(
                { userId: 1, subjectName: 1 },
                { unique: true, name: "userId_subjectName_hidden_unique" },
            ).catch(() => { /* already exists */ });
            for (const subjectName of seedNames) {
                if (hiddenSet.has(subjectName)) continue;
                await db.collection(SUBJECT_PICKER_HIDDEN_COLLECTION).updateOne(
                    { userId, subjectName },
                    {
                        $set: { updatedAt: new Date() },
                        $setOnInsert: {
                            userId,
                            subjectName,
                            createdAt: new Date(),
                        },
                    },
                    { upsert: true },
                );
                hiddenSet.add(subjectName);
            }
        }

        // Get distinct subjects the user has studied, treating null as "General"
        const subjectsRaw = await db.collection("pomodoroSessions").aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: { $ifNull: ["$subject", DEFAULT_SUBJECT] },
                    totalPomodoros: { $sum: "$completedCount" },
                    lastUsed: { $max: "$updatedAt" },
                },
            },
            { $sort: { lastUsed: -1 } },
        ]).toArray();

        const subjects = subjectsRaw
            .filter(s => !hiddenSet.has((s._id ?? "") as string))
            .map(s => ({
                name: s._id as string,
                totalPomodoros: s.totalPomodoros as number,
                lastUsed: s.lastUsed,
            }));

        return res.status(200).json({
            message: "Subjects retrieved successfully",
            data: subjects,
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
