import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { MonthlyStats } from "./MonthlyStats";
import { DailyStats } from "./DailyStats";
import { ActivitySummary } from "./ActivitiySummary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Provider } from "react-redux";
import { store } from "@/store/store";

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
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl shadow-xl">
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
                      <ActivitySummary />
                      <MonthlyStats />
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
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }