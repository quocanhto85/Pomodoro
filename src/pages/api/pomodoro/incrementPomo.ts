import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";

const DEFAULT_SUBJECT = "General";

/**
 * Validate an IANA timezone string sent by the client (e.g. "Australia/Adelaide").
 * Returns it if usable, otherwise falls back to "UTC". This guards against the
 * RangeError that Intl/toLocaleDateString throw on an unknown timezone.
 */
function resolveTimeZone(tz: unknown): string {
    if (typeof tz !== "string" || tz.length === 0) return "UTC";
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return tz;
    } catch {
        return "UTC";
    }
}

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
        // Counts may be fractional (e.g. a 12.5-min count-up session = 0.5 pomodoros).
        const parsedCount = Number(req.body.count);
        const count = Number.isFinite(parsedCount) && parsedCount > 0
            ? Math.round(parsedCount * 100) / 100
            : 1;

        // Resolve the user's timezone from the request. The browser knows it;
        // this server runs in UTC on Vercel and cannot infer it. Fall back to UTC.
        const timeZone = resolveTimeZone(req.body.timeZone);
        const now = new Date();

        // Get the user's local calendar date (in their timezone) as MM/DD/YYYY
        const localDateString = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone
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
                $inc: { completedCount: count },
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
