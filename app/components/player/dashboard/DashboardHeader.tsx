export function DashboardHeader() {
    return (
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-[#0d1b12] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                    E aí, <span className="text-[#13ec5b]">Craque!</span>
                </h3>
                <p className="text-[#4c9a66] text-base font-normal leading-normal max-w-xl">
                    Bora jogar? Marque seu próximo jogo ou confira seus convites.
                </p>
            </div>

            <div className="hidden md:block">
                <span className="text-xs font-bold text-[#4c9a66] uppercase tracking-wider mb-1 block">
                    Sua Performance
                </span>
                <div className="flex gap-1">
                    <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]" />
                    <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]" />
                    <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]/40" />
                    <div className="w-12 h-1.5 rounded-full bg-[#e7f3eb] dark:bg-[#2a4535]" />
                </div>
            </div>
        </section>
    );
}
