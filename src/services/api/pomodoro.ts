import axios from "axios";

export const pomodoroService = {
  incrementSession: async () => {
    try {
      const response = await axios.post("/api/pomodoro/increment");
      return response.data;
    } catch (error) {
      console.error("Error incrementing pomodoro session:", error);
      throw error;
    }
  }
};