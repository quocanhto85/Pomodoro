import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DailyRecord, PomodoroSession } from "@/types/stats";
import { pomodoroService } from "@/services/api/pomodoro";

interface StatsState {
  dailyStats: DailyRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  dailyStats: [],
  loading: false,
  error: null
};

export const fetchDailyStats = createAsyncThunk(
  "stats/fetchDailyStats", // This is just an action identifier for Redux
  async (date: Date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const response = await pomodoroService.getDailySessions(month, year);
    
    // Simply map the required fields from the response
    return response.data.map((session: PomodoroSession) => ({
      date: new Date(session.date).toISOString().split("T")[0],
      pomodoros: session.completedCount,
      hours: session.completedCount * 25 / 60
    }));
  }
);

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyStats = action.payload;
      })
      .addCase(fetchDailyStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch stats";
      });
  },
});

export default statsSlice.reducer;