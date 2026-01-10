export function ActivityFeed() {
    return (
        <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg text-[#0d1b12] dark:text-white">
                    Atividade Recente
                </h4>
                <button
                    disabled
                    className="text-[#4c9a66] opacity-50 cursor-not-allowed"
                    title="Em breve"
                >
                    <span className="material-symbols-outlined">more_horiz</span>
                </button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <div className="w-10 h-10 bg-gray-100 dark:bg-[#22382b] rounded-full flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-gray-400">
                        notifications_off
                    </span>
                </div>
                <p className="text-sm font-bold text-[#0d1b12] dark:text-white">
                    Nenhuma atividade recente
                </p>
                <p className="text-xs text-[#4c9a66]">
                    Suas notificações aparecerão aqui.
                </p>
            </div>
        </div>
    );
}
