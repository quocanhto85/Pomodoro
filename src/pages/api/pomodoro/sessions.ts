import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

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
      const userId = "anhtpq"; // Might get this from authentication
  
      const { month, year } = req.query;
  
      // Validate month and year
      const monthNum = parseInt(month as string);
      const yearNum = parseInt(year as string);
  
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ message: "Invalid month parameter" });
      }
  
      if (isNaN(yearNum)) {
        return res.status(400).json({ message: "Invalid year parameter" });
      }
  
      const sessions = await db.collection("pomodoroSessions").find({
          userId,
          month: monthNum,
          year: yearNum
        })
        .sort({ date: 1 })
        .toArray();
  
      return res.status(200).json({
        message: "Sessions retrieved successfully",
        data: sessions
      });
    } catch (error) {
      console.error("Error fetching pomodoro sessions:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }