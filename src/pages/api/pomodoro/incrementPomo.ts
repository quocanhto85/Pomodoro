import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

const DEFAULT_SUBJECT = "General";

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

        // Get subject from request body, default to "General"
        const subject = (req.body.subject as string)?.trim() || DEFAULT_SUBJECT;

        // Get current time in local timezone
        const now = new Date();

        // Get the local date string in YYYY-MM-DD format
        const localDateString = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        // Create UTC date from local date string
        const [month, day, year] = localDateString.split("/");
        const utcDate = new Date(Date.UTC(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
        ));

        // Find the most recent session (any subject) to determine gaps
        const lastSession = await db.collection("pomodoroSessions").findOne(
            { userId },
            { sort: { date: -1 } }
        );

        const bulkOps = [];

        if (lastSession) {
            const lastDate = new Date(lastSession.date);
            const dayDifference = Math.floor((utcDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDifference > 1) {
                const gapStartDate = new Date(lastDate);
                for (let i = 1; i < dayDifference; i++) {
                    gapStartDate.setUTCDate(gapStartDate.getUTCDate() + 1);

                    // Use upsert to avoid duplicate key errors for gap documents
                    bulkOps.push({
                        updateOne: {
                            filter: {
                                userId,
                                date: new Date(gapStartDate),
                                subject: DEFAULT_SUBJECT
                            },
                            update: {
                                $setOnInsert: {
                                    userId,
                                    date: new Date(gapStartDate),
                                    month: gapStartDate.getUTCMonth() + 1,
                                    year: gapStartDate.getUTCFullYear(),
                                    completedCount: 0,
                                    subject: DEFAULT_SUBJECT,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                }
                            },
                            upsert: true
                        }
                    });
                }
            }
        }

        // Execute gap-fill operations if any
        if (bulkOps.length > 0) {
            await db.collection("pomodoroSessions").bulkWrite(bulkOps);
        }

        // Upsert today's document for this specific subject
        const result = await db.collection("pomodoroSessions").updateOne(
            {
                userId,
                date: utcDate,
                subject: subject
            },
            {
                $inc: { completedCount: 1 },
                $set: { updatedAt: new Date() },
                $setOnInsert: {
                    userId,
                    date: utcDate,
                    month: utcDate.getUTCMonth() + 1,
                    year: utcDate.getUTCFullYear(),
                    subject: subject,
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        const isNew = result.upsertedCount > 0;

        return res.status(isNew ? 201 : 200).json({
            message: isNew
                ? "New pomodoro session created successfully"
                : "Pomodoro session updated successfully",
            data: result,
            subject: subject
        });
    } catch (error) {
        console.error("Error handling pomodoro session:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
