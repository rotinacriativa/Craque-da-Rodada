export default function DashboardPage() {
    return (
        <>
            {/* Page Heading */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-[#0d1b12] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Bem-vindo de volta, <span className="text-[#13ec5b]">Jogador!</span>
                    </h3>
                    <p className="text-[#4c9a66] text-base font-normal leading-normal max-w-xl">
                        Aqui está o resumo dos seus jogos. Você tem 2 convites pendentes e uma pelada confirmada para sexta.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="text-xs font-bold text-[#4c9a66] uppercase tracking-wider mb-1 block">Sua Performance</span>
                    <div className="flex gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]"></div>
                        <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]"></div>
                        <div className="w-12 h-1.5 rounded-full bg-[#13ec5b]/40"></div>
                        <div className="w-12 h-1.5 rounded-full bg-[#e7f3eb] dark:bg-[#2a4535]"></div>
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Card 1 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
                    <div className="flex justify-between items-start">
                        <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">Jogos Organizados</p>
                        <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                            <span className="material-symbols-outlined text-xl">stadium</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">12</p>
                        <span className="inline-flex items-center text-[#078829] dark:text-[#13ec5b] text-sm font-bold bg-[#e7f3eb] dark:bg-[#22382b] px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-base mr-0.5">trending_up</span>+2%
                        </span>
                    </div>
                    <p className="text-xs text-[#8baaa0] mt-1">Últimos 30 dias</p>
                </div>
                {/* Card 2 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
                    <div className="flex justify-between items-start">
                        <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">Participações</p>
                        <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                            <span className="material-symbols-outlined text-xl">directions_run</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">45</p>
                        <span className="inline-flex items-center text-[#078829] dark:text-[#13ec5b] text-sm font-bold bg-[#e7f3eb] dark:bg-[#22382b] px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-base mr-0.5">trending_up</span>+15%
                        </span>
                    </div>
                    <p className="text-xs text-[#8baaa0] mt-1">Últimos 30 dias</p>
                </div>
                {/* Card 3 */}
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a2c20] border border-[#cfe7d7] dark:border-[#2a4535] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(19,236,91,0.15)] transition-shadow group">
                    <div className="flex justify-between items-start">
                        <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-wider">Gols na Temporada</p>
                        <div className="p-2 bg-[#e7f3eb] dark:bg-[#22382b] text-[#13ec5b] rounded-lg group-hover:bg-[#13ec5b] group-hover:text-[#0d1b12] transition-colors">
                            <span className="material-symbols-outlined text-xl">sports_soccer</span>
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="text-[#0d1b12] dark:text-white text-4xl font-bold leading-tight">32</p>
                        <span className="inline-flex items-center text-[#078829] dark:text-[#13ec5b] text-sm font-bold bg-[#e7f3eb] dark:bg-[#22382b] px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-base mr-0.5">trending_up</span>+5%
                        </span>
                    </div>
                    <p className="text-xs text-[#8baaa0] mt-1">Média de 0.8 gols/jogo</p>
                </div>
            </section>

            {/* Featured Card: Next Game */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[#0d1b12] dark:text-white text-xl font-bold">Próxima Pelada</h4>
                    <a className="text-[#13ec5b] text-sm font-bold hover:underline" href="#">Ver agenda completa</a>
                </div>
                <div className="flex flex-col md:flex-row items-stretch gap-0 md:gap-6 rounded-[2rem] bg-white dark:bg-[#1a2c20] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#e7f3eb] dark:border-[#2a4535]">
                    {/* Card Image */}
                    <div className="w-full md:w-2/5 aspect-video md:aspect-auto bg-center bg-no-repeat bg-cover rounded-2xl md:rounded-3xl relative overflow-hidden group" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn1zLjEVJzzbfA6TQsi4mPWz6DPyZISrjM0oARG6tm3U10eaDmXgvuI2GeKtu4JeDz9JDEk-owaU-S7vJfd4sIzvuVbq7ayVwMnDDe-3flpSS5MSRFQh0NF_iQA8zsBmgzUMSvcsWVjM52PW6HwezkjqUIJm0WTiw7GcwK6tIPhcG6iLsbKByd886Zta5l-e6_GVFpQy_33J5uZ4z-sdbLRaR8dQjp-08S4aOYRmdiQB_QUUL1Sj6KeNbAa1T6L-lyQfMRCKjY-Rg')" }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                        <div className="absolute top-4 left-4 bg-[#13ec5b] text-[#0d1b12] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                            Confirmado
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="material-symbols-outlined text-sm">cloud</span>
                                <span className="text-xs font-medium">18°C • Sem chuva</span>
                            </div>
                        </div>
                    </div>
                    {/* Card Content */}
                    <div className="flex flex-1 flex-col gap-4 pt-4 md:pt-2">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[#13ec5b] text-sm font-bold uppercase tracking-wide">
                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                Sexta-feira, 20:00h
                            </div>
                            <h3 className="text-[#0d1b12] dark:text-white text-2xl md:text-3xl font-bold leading-tight">Pelada dos Amigos - Arena Soccer Grass</h3>
                            <div className="flex items-center gap-2 text-[#4c9a66] text-sm md:text-base font-medium mt-1">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                                Campo 3 • Barra Funda, São Paulo
                            </div>
                        </div>
                        {/* Players Avatars */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="flex -space-x-3 overflow-hidden">
                                <div className="inline-block size-10 rounded-full ring-2 ring-white dark:ring-[#1a2c20] bg-gray-300 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKsvu3ZtF8ZFGWn2rWl0pI9TleblhzCAw8G68x92CDg1CgvBDG5uBA10y9_LPX4QU-SLxAMp2s7yGSkLXcWNcAlLvaKmLRVnJK-XIlC84k0Q4H5fJHpyQz43PPnKHA3l5WpGmQXSuqmTKupv61rseYXJAAFUx1EJxYbYbnVOqhxAuEe--z35YFyiSN5qTuxb798_1xWVftgFHDQCrWlg__x8ywJ4Nr3d9dnQmThuZidSIQwfS4uzwqmufiPe9qaHrIQFHYxLJkwrE')" }}></div>
                                <div className="inline-block size-10 rounded-full ring-2 ring-white dark:ring-[#1a2c20] bg-gray-400 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBE_cW-OitKtRZgofFqC0TmHn6vzVMYunFLJRZnr3qX_hxF52kmesyyZp4XptAABcvPhdjs8mjQo8-fAdVrxMEeP7pGlY2vZ0IS9-2VKGE932hVJ24pDoN0n8qKZnRBS53HjqTulvxJTmQvS0WYvoMVH5vqJhB6XqL3k0Bfl71nUxOI8J2IPsRI7QOUGBLD6oXFS6OSZqjM_-auoxyg0dsZfg6p8kmbGgxBb-lrtzuqcy0mRkVGkbQp5KU2-nHepYCSoqTvCuyX1mM')" }}></div>
                                <div className="inline-block size-10 rounded-full ring-2 ring-white dark:ring-[#1a2c20] bg-gray-500 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCv6fnbYO2uNoqDb4jtPuKD1w5i6PN4cUPv718ZMh-e-5-E0xw77M63Y_iAC01Ie3rRWCsVaQg6VrHAficCwyPMKO06N9S_q_1H4M3rjsoBu5_ry9aXx89V1lKLB1BfzoDbhS1sNx5UGP0CxmJ6moHnswH3GZL6mJsHNxTpBL1LwQabP8FxfO7BRZxEiN86YlaLJjt4Rswdr0KTZXAOGYkdK4NCmSCBpQ7TYCIN-PIvwgxYUFHgwdkLsxzp87qmgUWvwAnAYryTI98')" }}></div>
                                <div className="inline-block size-10 rounded-full ring-2 ring-white dark:ring-[#1a2c20] bg-[#e7f3eb] dark:bg-[#22382b] flex items-center justify-center text-xs font-bold text-[#0d1b12] dark:text-white">
                                    +9
                                </div>
                            </div>
                            <span className="text-sm font-medium text-[#4c9a66]">12 confirmados</span>
                        </div>
                        <div className="mt-auto flex gap-3 pt-4 border-t border-[#e7f3eb] dark:border-[#2a4535]">
                            <button className="flex-1 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#13ec5b] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0fd651] transition-colors shadow-lg shadow-[#13ec5b]/20">
                                <span className="truncate">Ver Detalhes</span>
                            </button>
                            <button className="cursor-pointer items-center justify-center overflow-hidden rounded-full size-12 bg-[#e7f3eb] dark:bg-[#22382b] text-[#0d1b12] dark:text-white hover:bg-[#d8ebe0] dark:hover:bg-[#2a4535] transition-colors flex">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Access / Secondary Content */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-[#1a2c20] rounded-[2rem] p-6 border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-lg text-[#0d1b12] dark:text-white">Atividade Recente</h4>
                        <button className="text-[#4c9a66] hover:text-[#13ec5b] transition-colors">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-4">
                        {/* Activity Item */}
                        <div className="flex items-center gap-4 pb-4 border-b border-[#f0f7f2] dark:border-[#2a4535] last:border-0 last:pb-0">
                            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">payments</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Pagamento Recebido</p>
                                <p className="text-xs text-[#4c9a66] truncate">Mensalidade de Outubro - João P.</p>
                            </div>
                            <span className="text-xs font-bold text-[#0d1b12] dark:text-white">R$ 30,00</span>
                        </div>
                        {/* Activity Item */}
                        <div className="flex items-center gap-4 pb-4 border-b border-[#f0f7f2] dark:border-[#2a4535] last:border-0 last:pb-0">
                            <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">person_add</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Novo Jogador no Grupo</p>
                                <p className="text-xs text-[#4c9a66] truncate">André entrou em "Peladeiros"</p>
                            </div>
                            <span className="text-xs text-[#4c9a66]">2h atrás</span>
                        </div>
                        {/* Activity Item */}
                        <div className="flex items-center gap-4 pb-4 border-b border-[#f0f7f2] dark:border-[#2a4535] last:border-0 last:pb-0">
                            <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-xl">warning</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#0d1b12] dark:text-white truncate">Vaga Disponível</p>
                                <p className="text-xs text-[#4c9a66] truncate">Alguém desistiu da Pelada de Sexta</p>
                            </div>
                            <button className="text-xs font-bold text-[#13ec5b] hover:underline">Assumir</button>
                        </div>
                    </div>
                </div>
                {/* Invite Banner */}
                <div className="bg-[#0d1b12] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-[-20px] bottom-[-40px] opacity-20 group-hover:scale-110 transition-transform duration-500">
                        <span className="material-symbols-outlined text-[180px] text-[#13ec5b]">mark_email_unread</span>
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-white font-bold text-xl mb-2">Convide seus amigos</h4>
                        <p className="text-[#8baaa0] text-sm mb-6 max-w-[200px]">Aumente a resenha! Traga seus amigos para organizar o jogo com você.</p>
                        <button className="bg-[#13ec5b] text-[#0d1b12] font-bold py-3 px-6 rounded-full w-fit hover:bg-white transition-colors">
                            Enviar Convite
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
