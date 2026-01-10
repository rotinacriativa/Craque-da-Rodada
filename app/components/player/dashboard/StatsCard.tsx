interface StatsCardProps {
    title: string;
    value: number | string;
    icon: string;
    subtitle?: string;
    active?: boolean;
}

export function StatsCard({ title, value, icon, subtitle, active = true }: StatsCardProps) {
    if (!active) {
        return (
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-sm opacity-60">
                <div className="flex justify-between items-start">
                    <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">{title}</p>
                    <div className="p-2 bg-gray-100 dark:bg-[#22382b] text-gray-400 rounded-lg">
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-gray-400 text-2xl font-bold leading-tight">Em breve</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">{subtitle || 'Funcionalidade em desenvolvimento'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
            <div className="flex justify-between items-start">
                <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">{title}</p>
                <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">{value}</p>
            </div>
            {subtitle && <p className="text-xs text-[#8baaa0] mt-1">{subtitle}</p>}
        </div>
    );
}
