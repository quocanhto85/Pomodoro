import {
  Dialog,
  DialogPanel,
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition
} from "@headlessui/react";
import { X, ChevronDown } from "lucide-react";
import { MonthlyStats } from "./MonthlyStats";
import { DailyStats } from "./DailyStats";
import { ActivitySummary } from "./ActivitiySummary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useState, useEffect, Fragment } from "react";
import { pomodoroService } from "@/services/api/pomodoro";
import { showErrorToast } from "@/components/common";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: "summary", label: "Summary" },
  { id: "detail", label: "Detail" },
  { id: "ranking", label: "Ranking" }
];

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingStates, setLoadingStates] = useState({
    summary: false,
    detail: false,
    ranking: false
  });
  const [statsData, setStatsData] = useState({
    totalPomodoros: 0,
    monthlyPomodoros: Array(12).fill(0)
  });

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  useEffect(() => {
    const loadData = async () => {
      setLoadingStates(prev => ({ ...prev, summary: true }));
      try {
        const response = await pomodoroService.fetchStats(selectedYear);
        setStatsData({
          totalPomodoros: response.totalPomodoros,
          monthlyPomodoros: response.monthlyPomodoros
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        showErrorToast({
          message: "Unable to load statistics. Please try again later."
        });
      } finally {
        setLoadingStates(prev => ({ ...prev, summary: false }));
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [selectedYear, isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-4xl bg-white rounded-xl shadow-xl h-[90vh] overflow-hidden flex flex-col">
          <Tabs defaultValue="summary" className="w-full h-full flex flex-col">
            <div className="flex-none border-b border-gray-200">
              <div className="flex items-center justify-between px-6">
                <TabsList className="border-none">
                  {tabs.map(tab => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="relative px-4 sm:px-8 py-4 font-medium text-gray-600 hover:text-gray-900 transition-colors data-[state=active]:text-rose-600 before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-rose-600 before:opacity-0 data-[state=active]:before:opacity-100 before:transition-opacity"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <button
                  onClick={onClose}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0">
              <TabsContent value="summary" className="mt-0 h-full">
                <div className="space-y-4 sm:space-y-6 relative min-h-0">
                  {loadingStates.summary && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
                        <p className="text-gray-600 font-medium">Loading statistics...</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mb-4 sm:mb-6">
                    <Listbox value={selectedYear} onChange={setSelectedYear}>
                      <div className="relative w-[120px] sm:w-[140px]">
                        <ListboxButton className="relative w-full h-[38px] sm:h-[42px] bg-white border border-gray-200 rounded-xl shadow-sm px-3 sm:px-4 py-2 text-left cursor-pointer group hover:border-rose-200 hover:bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all duration-200">
                          <span className="block truncate text-center font-medium text-gray-700 group-hover:text-rose-600 text-sm sm:text-base">
                            {selectedYear}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                            <ChevronDown
                              className="h-4 w-4 text-gray-400 group-hover:text-rose-400 transition-colors duration-200"
                              aria-hidden="true"
                            />
                          </span>
                        </ListboxButton>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-2"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-2"
                        >
                          <ListboxOptions className="absolute z-50 mt-2 w-full max-h-48 bg-white rounded-xl shadow-lg border border-gray-200/75 py-1 overflow-auto focus:outline-none">
                            {years.map((year) => (
                              <ListboxOption
                                key={year}
                                value={year}
                                className={({ selected }) => `
                                  relative cursor-pointer select-none py-2 px-3 sm:py-2.5 sm:px-4 mx-1 my-0.5
                                  text-center font-medium rounded-lg transition-colors duration-150 text-sm sm:text-base
                                  ui-active:bg-rose-50 ui-active:text-rose-600
                                  ${selected
                                    ? "bg-rose-50 text-rose-600"
                                    : "text-gray-700 hover:bg-rose-50/50 hover:text-rose-500"
                                  }
                                `}
                              >
                                {year}
                              </ListboxOption>
                            ))}
                          </ListboxOptions>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>

                  <ActivitySummary totalPomodoros={statsData.totalPomodoros} />
                  <MonthlyStats monthlyPomodoros={statsData.monthlyPomodoros} />
                </div>
              </TabsContent>

              <TabsContent value="detail">
                <Provider store={store}>
                  <DailyStats />
                </Provider>
              </TabsContent>

              <TabsContent value="ranking">
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  Ranking feature coming soon!
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogPanel>
      </div>
    </Dialog>
  );
}