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
        
        // Get the year from request body, default to current year
        const year = parseInt(req.body.year as string) || new Date().getFullYear();

        // Create date range for the year
        const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

        // Get total completedCount for the year
        const yearlyTotal = await db.collection("pomodoroSessions").aggregate([
            {
                $match: {
                    userId,
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$completedCount" }
                }
            }
        ]).toArray();

        // Get monthly totals
        const monthlyTotals = await db.collection("pomodoroSessions").aggregate([
            {
                $match: {
                    userId,
                    date: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$completedCount" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]).toArray();

        // Convert monthly totals to array with all months
        const monthlyData = Array(12).fill(0);
        monthlyTotals.forEach(month => {
            monthlyData[month._id - 1] = month.total;
        });

        return res.status(200).json({
            totalPomodoros: yearlyTotal[0]?.total || 0,
            monthlyPomodoros: monthlyData
        });
    } catch (error) {
        console.error("Error fetching pomodoro statistics:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}