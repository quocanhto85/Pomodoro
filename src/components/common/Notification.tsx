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
    <div className="hud-error-toast flex items-start gap-3">
        <XCircle className="hud-error-icon h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
            <p className="hud-error-title font-medium text-gray-900">Error</p>
            <p className="hud-error-message text-sm text-gray-600 mt-1">{message}</p>
        </div>
    </div>
);

export const showErrorToast = ({
    message,
    duration = 4000
}: ErrorToastProps) => {
    toast.custom(() => (
        <div className="hud-error-toast-card bg-white rounded-lg shadow-lg border border-gray-100 p-4 max-w-md w-full">
            <ErrorToastContent message={message} />
        </div>
    ), {
        duration,
        className: "error-toast",
        position: "top-center",
        dismissible: true,
    });
};