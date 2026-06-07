import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/db/mongodb/client";
import { ObjectId } from "mongodb";
import { getUserIdFromRequest, OWNER_USER_ID } from "@/lib/auth";

/**
 * One-time migration endpoint to upgrade the pomodoroSessions collection
 * for subject-based tracking.
 * 
 * This migration:
 * 1. Adds `subject: "General"` to all existing documents that don't have a subject field
 * 2. Merges duplicate (userId, date, subject) documents by summing completedCount
 * 3. Drops the old unique index on (userId, date)
 * 4. Creates a new unique index on (userId, date, subject)
 * 
 * Safe to run multiple times (idempotent).
 * 
 * Usage: POST /api/pomodoro/migrate
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Global, destructive maintenance — restrict to the owner.
        const userId = await getUserIdFromRequest(req, res);
        if (userId !== OWNER_USER_ID) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const client = await clientPromise;
        const db = client.db("pomodoro_app");
        const collection = db.collection("pomodoroSessions");

        const results: string[] = [];

        // Step 1: Add subject field to all documents that don't have one
        const updateResult = await collection.updateMany(
            { subject: { $exists: false } },
            { $set: { subject: "General" } }
        );
        results.push(
            `Step 1a: Updated ${updateResult.modifiedCount} documents with subject: "General"`
        );

        const nullUpdateResult = await collection.updateMany(
            { subject: null },
            { $set: { subject: "General" } }
        );
        results.push(
            `Step 1b: Updated ${nullUpdateResult.modifiedCount} documents with null subject`
        );

        // Step 2: Find and merge duplicate (userId, date, subject) documents
        const duplicates = await collection.aggregate([
            {
                $group: {
                    _id: { userId: "$userId", date: "$date", subject: "$subject" },
                    count: { $sum: 1 },
                    totalCompleted: { $sum: "$completedCount" },
                    docIds: { $push: "$_id" },
                    earliestCreated: { $min: "$createdAt" },
                    latestUpdated: { $max: "$updatedAt" }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        let mergedCount = 0;
        let deletedCount = 0;

        for (const dup of duplicates) {
            const keepId = dup.docIds[0] as ObjectId;
            const removeIds = (dup.docIds as ObjectId[]).slice(1);

            // Update the keeper with the merged totals
            await collection.updateOne(
                { _id: keepId },
                {
                    $set: {
                        completedCount: dup.totalCompleted,
                        createdAt: dup.earliestCreated,
                        updatedAt: dup.latestUpdated
                    }
                }
            );

            // Delete the duplicates
            await collection.deleteMany({ _id: { $in: removeIds } });

            mergedCount++;
            deletedCount += removeIds.length;
        }

        results.push(
            `Step 2: Merged ${mergedCount} duplicate groups, deleted ${deletedCount} redundant documents`
        );

        // Step 3: Drop the old unique index on (userId, date) if it exists
        const indexes = await collection.indexes();
        for (const idx of indexes) {
            const key = idx.key as Record<string, number>;
            if (
                key.userId === 1 &&
                key.date === 1 &&
                !key.subject &&
                idx.name !== "_id_"
            ) {
                try {
                    await collection.dropIndex(idx.name!);
                    results.push(`Step 3: Dropped old index "${idx.name}"`);
                } catch (err) {
                    results.push(`Step 3: Could not drop index "${idx.name}": ${err}`);
                }
            }
        }

        // Step 4: Create the new compound unique index
        try {
            await collection.createIndex(
                { userId: 1, date: 1, subject: 1 },
                { unique: true, name: "userId_date_subject_unique" }
            );
            results.push('Step 4: Created new unique index on (userId, date, subject)');
        } catch (err: unknown) {
            const mongoErr = err as { code?: number; codeName?: string; message?: string };
            if (mongoErr.code === 85 || mongoErr.codeName === "IndexOptionsConflict") {
                results.push('Step 4: Index (userId, date, subject) already exists - skipped');
            } else {
                results.push(`Step 4: Error creating index: ${mongoErr.message ?? String(err)}`);
            }
        }

        // Verify final state
        const finalIndexes = await collection.indexes();
        results.push(`Final indexes: ${finalIndexes.map(i => i.name).join(", ")}`);

        return res.status(200).json({
            message: "Migration completed successfully",
            steps: results
        });
    } catch (error) {
        console.error("Migration error:", error);
        return res.status(500).json({ message: "Migration failed", error: String(error) });
    }
}
