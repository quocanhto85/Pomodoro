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

        // Get today's date at midnight UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Find the most recent session
        const lastSession = await db.collection("pomodoroSessions").findOne(
            { userId },
            { sort: { date: -1 } }
        );

        const bulkOps = [];

        if (lastSession) {
            const lastDate = new Date(lastSession.date);
            const dayDifference = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            // If there's a gap of days, create documents for missing days
            if (dayDifference > 1) {
                // Start from the day after the last session
                const gapStartDate = new Date(lastDate);

                // Create documents for each missing day
                for (let i = 1; i < dayDifference; i++) {
                    gapStartDate.setUTCDate(gapStartDate.getUTCDate() + 1);

                    const gapDocument = {
                        userId,
                        date: new Date(gapStartDate), // Create new Date object to avoid reference
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

        // Check if today's document exists
        const todaySession = await db.collection("pomodoroSessions").findOne({
            userId,
            date: today
        });

        let result;

        if (!todaySession) {
            // Create today's document
            const todayDocument = {
                userId,
                date: today,
                month: today.getUTCMonth() + 1,
                year: today.getUTCFullYear(),
                completedCount: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            if (bulkOps.length > 0) {
                // Add today's document to bulk operations
                bulkOps.push({
                    insertOne: {
                        document: todayDocument
                    }
                });

                // Execute all inserts in one bulk operation
                result = await db.collection("pomodoroSessions").bulkWrite(bulkOps);
            } else {
                // Just insert today's document
                result = await db.collection("pomodoroSessions").insertOne(todayDocument);
            }

            return res.status(201).json({
                message: "New pomodoro session(s) created successfully",
                data: result,
                gapsFilled: bulkOps.length - 1 // Exclude today's document
            });
        } else {
            // If there were gap documents to insert, do that first
            if (bulkOps.length > 0) {
                await db.collection("pomodoroSessions").bulkWrite(bulkOps);
            }

            // Update today's document
            result = await db.collection("pomodoroSessions").updateOne(
                { userId, date: today },
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