import axios from "axios";
import { StatsResponse, ServiceResult } from "@/types/stats";

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

  fetchStats: async (selectedYear: number): Promise<ServiceResult> => {
    try {
      const response = await axios.post("/api/pomodoro/stats", {
        year: selectedYear
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching pomodoro stats:", error);
      return {
        success: false,
        error: "Unable to load statistics. Please try again later."
      };
    }
  },

};