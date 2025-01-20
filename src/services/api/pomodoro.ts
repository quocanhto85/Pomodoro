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

  updateGoogleSheet: async () => {
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error('Make webhook URL not configured');
      }

      const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

      const response = await axios.post(webhookUrl, {
        date: today,
        incrementPomodoro: 1
      });

      return response.data;
    } catch (error) {
      console.error("Error updating Google Sheet:", error);
      throw error;
    }
  }
};