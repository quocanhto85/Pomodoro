import axios from "axios";
import { useState } from "react";
import TimerDisplay from "@/components/timer/TimerDisplay";

const TimerContainer = () => {
  const [isRunning, setIsRunning] = useState(false);

  const onSkip = async () => {
    try {

    } catch (error) { 
      // Handle errors
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const onToggle = () => {
    console.log("Skipping current session");
  };

  return (
    <TimerDisplay
      timeLeft={1500}
      isRunning={isRunning}
      mode="pomodoro"
      onToggle={onToggle}
      onSkip={onSkip}
    />
  );
};

export default TimerContainer;
