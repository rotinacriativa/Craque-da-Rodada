interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = 'md',
    message,
    fullScreen = false
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'size-6 border-2',
        md: 'size-10 border-4',
        lg: 'size-16 border-4'
    };

    const containerClasses = fullScreen
        ? 'flex-1 flex items-center justify-center min-h-[400px] w-full'
        : 'flex items-center justify-center';

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-3">
                <span
                    className={`${sizeClasses[size]} block rounded-full border-[#13ec5b] border-r-transparent animate-spin`}
                />
                {message && (
                    <p className="text-sm text-[#4c9a66] dark:text-[#8baaa0] font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
