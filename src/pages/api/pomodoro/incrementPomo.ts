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

        // Get current time in local timezone
        const now = new Date();
        console.log("=== Time Debug Logs ===");
        console.log("Current time:", now.toISOString());
        console.log("Current local time:", now.toLocaleString());

        // Get the local date string in YYYY-MM-DD format
        const localDateString = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Uses the system timezone
        });

        // Create UTC date from local date string
        const [month, day, year] = localDateString.split("/");
        const utcDate = new Date(Date.UTC(
            parseInt(year),
            parseInt(month) - 1, // Months are 0-based
            parseInt(day)
        ));

        console.log("Local date string:", localDateString);
        console.log("UTC date for storage:", utcDate.toISOString());
        console.log("========================");

        // Find the most recent session
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

                    const gapDocument = {
                        userId,
                        date: new Date(gapStartDate),
                        month: gapStartDate.getUTCMonth() + 1,
                        year: gapStartDate.getUTCFullYear(),
                        completedCount: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    bulkOps.push({
                        insertOne: {
                            document: gapDocument
                        }
                    });
                }
            }
        }

        // Check if today's document exists - use exact UTC midnight time
        const todaySession = await db.collection("pomodoroSessions").findOne({
            userId,
            date: utcDate  // This will match exactly at UTC midnight
        });

        let result;

        if (!todaySession) {
            const todayDocument = {
                userId,
                date: utcDate,
                month: utcDate.getUTCMonth() + 1,
                year: utcDate.getUTCFullYear(),
                completedCount: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            if (bulkOps.length > 0) {
                bulkOps.push({
                    insertOne: {
                        document: todayDocument
                    }
                });
                result = await db.collection("pomodoroSessions").bulkWrite(bulkOps);
            } else {
                result = await db.collection("pomodoroSessions").insertOne(todayDocument);
            }

            return res.status(201).json({
                message: "New pomodoro session(s) created successfully",
                data: result,
                gapsFilled: bulkOps.length - 1
            });
        } else {
            if (bulkOps.length > 0) {
                await db.collection("pomodoroSessions").bulkWrite(bulkOps);
            }

            result = await db.collection("pomodoroSessions").updateOne(
                { userId, date: utcDate },
                {
                    $inc: { completedCount: 1 },
                    $set: { updatedAt: new Date() }
                }
            );

            return res.status(200).json({
                message: "Pomodoro session updated successfully",
                data: result,
                gapsFilled: bulkOps.length
            });
        }
    } catch (error) {
        console.error("Error handling pomodoro session:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}