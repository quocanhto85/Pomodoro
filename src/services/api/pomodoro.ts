import axios from "axios";

export const pomodoroService = {
  incrementSession: async () => {
    try {
      const response = await axios.post("/api/pomodoro/incrementPomo");
      return response.data;
    } catch (error) {
      console.error("Error incrementing pomodoro session:", error);
      throw error;
    }
  },

  getDailySessions: async (month: number, year: number) => {
    try {
      const response = await axios.get("/api/pomodoro/sessions", {
        params: {
          month, year
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pomodoro sessions:", error);
      throw error;
    }
  },

  fetchStats: async (selectedYear: number) => {
    try {
      const response = await axios.post("/api/pomodoro/stats", {
        params: selectedYear
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pomodoro stats:", error);
      throw error;
    }
  },
};