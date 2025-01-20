import mongoose from "mongoose";

const PomodoroSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: {
    type: Date, required: true, default: () => {
      const date = new Date();
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
  },
  month: { type: Number, required: true, min: 1, max: 12, index: true },
  year: { type: Number, required: true, index: true },
  completedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Create compound index for efficient queries
PomodoroSessionSchema.index({ userId: 1, date: 1 }, { unique: true });

// Virtual property for hours (not stored in DB, calculated on-the-fly)
PomodoroSessionSchema.virtual('hours').get(function () {
  return (this.completedCount * 25) / 60; // 25 minutes per pomodoro
});

// Ensure virtuals are included when converting to JSON
PomodoroSessionSchema.set('toJSON', { virtuals: true });
PomodoroSessionSchema.set('toObject', { virtuals: true });

const PomodoroSession = mongoose.models.PomodoroSession ||
  mongoose.model("PomodoroSession", PomodoroSessionSchema);

export default PomodoroSession;