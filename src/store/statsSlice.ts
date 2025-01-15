import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DailyRecord } from "@/types/stats";

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
  "stats/fetchDaily",
  async (month: Date) => {
    // This will be replaced with actual API call
    const mockData: DailyRecord[] = [
      { date: "2024-01-01", pomodoros: 8, hours: 3.33 },
      { date: "2024-01-02", pomodoros: 12, hours: 5.00 },
      { date: "2024-01-03", pomodoros: 6, hours: 2.50 },
      { date: "2024-01-04", pomodoros: 10, hours: 4.17 },
      { date: "2024-01-05", pomodoros: 15, hours: 6.25 },
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
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