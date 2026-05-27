const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const OLD_SUBJECT = "💻Computer Science";
const NEW_SUBJECT = "💻 Computer Science";
const DB_NAME = "pomodoro_app";

function loadMongoUri() {
  const envPath = path.join(__dirname, ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*MONGODB_URI\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  throw new Error("MONGODB_URI not found in .env.local");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const uri = loadMongoUri();
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(DB_NAME);
    const sessions = db.collection("pomodoroSessions");

    const oldDocs = await sessions.find({ subject: OLD_SUBJECT }).toArray();
    console.log(`Found ${oldDocs.length} session(s) with subject "${OLD_SUBJECT}"`);

    let merged = 0;
    let renamed = 0;

    for (const oldDoc of oldDocs) {
      const existing = await sessions.findOne({
        userId: oldDoc.userId,
        date: oldDoc.date,
        subject: NEW_SUBJECT,
      });

      const dateStr = oldDoc.date instanceof Date
        ? oldDoc.date.toISOString().slice(0, 10)
        : String(oldDoc.date);

      if (existing) {
        console.log(
          `  MERGE ${oldDoc.userId} ${dateStr}: ` +
          `${oldDoc.completedCount} (old) + ${existing.completedCount} (existing) ` +
          `→ ${oldDoc.completedCount + existing.completedCount}`
        );
        if (!dryRun) {
          await sessions.updateOne(
            { _id: existing._id },
            {
              $inc: { completedCount: oldDoc.completedCount },
              $set: { updatedAt: new Date() },
            }
          );
          await sessions.deleteOne({ _id: oldDoc._id });
        }
        merged++;
      } else {
        console.log(`  RENAME ${oldDoc.userId} ${dateStr}: count=${oldDoc.completedCount}`);
        if (!dryRun) {
          await sessions.updateOne(
            { _id: oldDoc._id },
            { $set: { subject: NEW_SUBJECT, updatedAt: new Date() } }
          );
        }
        renamed++;
      }
    }

    const hiddenDeleteResult = dryRun
      ? { deletedCount: await db.collection("subjectPickerHidden").countDocuments({ subjectName: OLD_SUBJECT }) }
      : await db.collection("subjectPickerHidden").deleteMany({ subjectName: OLD_SUBJECT });

    console.log("");
    console.log(`Sessions merged: ${merged}`);
    console.log(`Sessions renamed: ${renamed}`);
    console.log(`subjectPickerHidden entries removed: ${hiddenDeleteResult.deletedCount}`);
    if (dryRun) console.log("\n(DRY RUN — no changes written. Re-run without --dry-run to apply.)");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
