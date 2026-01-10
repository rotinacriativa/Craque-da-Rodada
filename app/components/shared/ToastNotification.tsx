import { ToastType } from "../../../src/hooks/shared/useToast";

interface ToastNotificationProps {
    type: ToastType;
    message: string;
}

export function ToastNotification({ type, message }: ToastNotificationProps) {
    const styles = {
        success: {
            bg: 'bg-green-50 border-green-200 text-green-700',
            icon: 'check_circle'
        },
        error: {
            bg: 'bg-red-50 border-red-200 text-red-700',
            icon: 'error'
        },
        info: {
            bg: 'bg-blue-50 border-blue-200 text-blue-700',
            icon: 'info'
        }
    };

    const style = styles[type];

    return (
        <div className={`${style.bg} border px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right fade-in duration-300 pointer-events-auto`}>
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">{style.icon}</span>
                <span className="block text-sm font-medium">{message}</span>
            </div>
        </div>
    );
}
