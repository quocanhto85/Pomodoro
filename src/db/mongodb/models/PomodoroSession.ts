import mongoose from "mongoose";

const PomodoroSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  completedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.PomodoroSession || 
  mongoose.model("PomodoroSession", PomodoroSessionSchema);