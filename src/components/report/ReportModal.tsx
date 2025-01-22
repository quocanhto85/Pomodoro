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
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [selectedYear, isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-4xl bg-white rounded-xl shadow-xl">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="border-b">
                {tabs.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="px-8 py-4 font-medium data-[state=active]:text-rose-600 data-[state=active]:border-b-2 data-[state=active]:border-rose-600"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="p-6">
                <TabsContent value="summary">
                  <div className="space-y-8">
                    {/* HeadlessUI Listbox Year Picker */}
                    <div className="flex justify-center mb-6">
                      <Listbox value={selectedYear} onChange={setSelectedYear}>
                        <div className="relative w-[140px]">
                          <ListboxButton className="relative w-full h-[42px] bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 text-left cursor-pointer group hover:border-rose-200 hover:bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all duration-200">
                            <span className="block truncate text-center font-medium text-gray-700 group-hover:text-rose-600">
                              {selectedYear}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
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
                            <ListboxOptions className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200/75 py-1 overflow-auto focus:outline-none">
                              {years.map((year) => (
                                <ListboxOption
                                  key={year}
                                  value={year}
                                  className={({ selected }) => `
                                    relative cursor-pointer select-none py-2.5 px-4 mx-1 my-0.5
                                    text-center font-medium rounded-lg transition-colors duration-150
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
                  <div className="text-center py-12 text-gray-500">
                    Ranking feature coming soon!
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}