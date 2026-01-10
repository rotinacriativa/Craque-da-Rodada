interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    retryText?: string;
}

export function ErrorState({
    title = "Ops! Algo deu errado.",
    message,
    onRetry,
    retryText = "Tentar Novamente"
}: ErrorStateProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[400px] text-center p-8">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-4">
                <span className="material-symbols-outlined text-3xl text-red-500">error</span>
            </div>
            <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-[#4c9a66] dark:text-[#8baaa0] mb-6 max-w-md">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-bold transition-colors"
                >
                    {retryText}
                </button>
            )}
        </div>
    );
}
