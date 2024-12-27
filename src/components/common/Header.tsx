import Button from "./Button";
import { ChartLine, Check, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2 text-white">
        <Check className="w-8 h-8" />
        <span className="text-2xl font-bold">Pomodoro - Boost your productivity</span>
      </div>
      <div className="flex gap-2">
        <Button className="flex items-center gap-2">
          <ChartLine className="w-5 h-5" />
          Report
        </Button>
        <Button className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Setting
        </Button>
      </div>
    </header>
  );
}