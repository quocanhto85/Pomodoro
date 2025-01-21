import Button from "./Button";
import { ChartLine, Check, Settings, User, LogOut } from "lucide-react";
import { useState } from "react";
import { ReportModal } from "@/components/report/ReportModal";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@radix-ui/react-dropdown-menu";

export default function Header() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2 text-white">
        <Check className="w-8 h-8" />
        <span className="text-2xl font-bold">Pomodoro - Boost your productivity</span>
      </div>
      <div className="flex gap-2">
        <Button className="group flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white transition-all duration-300 ease-in-out hover:bg-white/20 hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-lg" onClick={() => setIsReportModalOpen(true)}>
          <ChartLine className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">Report</span>
        </Button>
        <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DropdownMenuTrigger asChild>
            <Button className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 ease-in-out backdrop-blur-lg
                ${isSettingsOpen 
                  ? 'bg-white/20 shadow-lg scale-105' 
                  : 'bg-white/10 hover:bg-white/15 hover:shadow-lg hover:scale-105'} 
                active:scale-95`}>
              <Settings className={`w-5 h-5 transition-all duration-300 ease-in-out
                  ${isSettingsOpen 
                    ? 'rotate-180 scale-110' 
                    : 'group-hover:rotate-90 group-hover:scale-110'}`} />
              <span className={`transition-transform duration-300 ${isSettingsOpen ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>Setting</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 mt-2 p-1 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg
              data-[state=open]:animate-in data-[state=closed]:animate-out
              data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
              data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
              data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
              duration-300 ease-in-out"
            align="end"
            sideOffset={5}
          >
            <DropdownMenuItem 
              className="group flex items-center px-3 py-2 text-white rounded-md cursor-pointer outline-none
                transition-all duration-200 ease-in-out hover:bg-white/20 focus:bg-white/20"
            >
              <User className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 h-px bg-white/20" />
            <DropdownMenuItem 
              className="group flex items-center px-3 py-2 text-white rounded-md cursor-pointer outline-none
                transition-all duration-200 ease-in-out hover:bg-white/20 focus:bg-white/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </header>
  );
}