import { toast } from "sonner";
import { XCircle } from "lucide-react";

interface ErrorToastProps {
    message: string;
    duration?: number;
}

interface ErrorToastContentProps {
    message: string;
}

const ErrorToastContent = ({ message }: ErrorToastContentProps) => (
    <div className="flex items-start gap-3">
        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
            <p className="font-medium text-gray-900">Error</p>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
    </div>
);

export const showErrorToast = ({
    message,
    duration = 2000
}: ErrorToastProps) => {
    toast.custom((id) => (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 max-w-md w-full">
            <ErrorToastContent message={message} />
        </div>
    ), {
        id: "error-toast",
        duration,
        className: "error-toast",
        position: "top-center",
        dismissible: true,
    });
};