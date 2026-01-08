export default function RankingPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Page Header (Custom for Ranking) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Ranking de Jogadores</h2>
                    <p className="text-sm text-[#4c9a66] dark:text-gray-400">Acompanhe quem está mandando bem na temporada.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a2c20] px-4 py-2 rounded-full border border-[#e7f3eb] dark:border-[#2a4535] shadow-sm">
                    <span>Última atualização: Hoje, 14:30</span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a4535] rounded-full transition-colors ml-1">
                        <span className="material-symbols-outlined text-lg">refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] rounded-lg text-sm font-medium hover:border-[#13ec5b] transition-colors text-[#0d1b12] dark:text-white shadow-sm whitespace-nowrap">
                        <span className="material-symbols-outlined text-[#13ec5b] text-lg">calendar_today</span>
                        <span>Temporada 2026</span>
                        <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2c20] border border-[#e7f3eb] dark:border-[#2a4535] rounded-lg text-sm font-medium hover:border-[#13ec5b] transition-colors text-[#0d1b12] dark:text-white shadow-sm whitespace-nowrap">
                        <span className="material-symbols-outlined text-[#13ec5b] text-lg">groups</span>
                        <span>Todos os Grupos</span>
                        <span className="material-symbols-outlined text-gray-400 text-base">expand_more</span>
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-[#0ea841] bg-[#13ec5b]/20 hover:bg-[#13ec5b]/30 transition-colors whitespace-nowrap">
                        Artilheiros
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a4535] transition-colors whitespace-nowrap">
                        Assistências
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a4535] transition-colors whitespace-nowrap">
                        Nota Média
                    </button>
                </div>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-end max-w-5xl mx-auto w-full pt-8">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 flex flex-col items-center">
                    <div className="relative group cursor-pointer w-full">
                        <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] flex flex-col items-center relative z-10 transform hover:-translate-y-1 transition-transform">
                            <div className="relative mb-3">
                                <div className="w-20 h-20 rounded-full border-4 border-gray-300 dark:border-gray-500 overflow-hidden">
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8cPkTqMH54Mnmww-wXXPNz01sJJOZQDIMfjv0p71SegcXke1GFVeB7t5BaIinl7XOVtHPUdSPQ66e_9Ds1KOTlJQ3aa5KV3Vn0oYES9ygTGPyAwFhLVAgseLiqxlrTiAmZbinr1t78NfJ4eMLCaaUCbESdEbdc-T0_ctXeGu3UVeVW_jggC3Y6tU3V45GaaGDs6NNNlCk4frLG3wCbioIFIeVxi5p61jLvk4t1EmOhobJyJUJprjWqBWnyx3_cegK7jiCsQkiA4M')" }}></div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gray-300 dark:bg-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white dark:border-[#1a2c20]">2</div>
                            </div>
                            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Carlos Silva</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Meia Atacante</p>
                            <div className="flex gap-4 text-center w-full justify-center border-t border-[#f0f7f2] dark:border-[#2a4535] pt-3">
                                <div>
                                    <div className="text-xs text-gray-400 uppercase">Gols</div>
                                    <div className="font-bold text-gray-700 dark:text-gray-300">18</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase">Nota</div>
                                    <div className="font-bold text-[#13ec5b]">8.9</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 flex flex-col items-center w-full">
                    <div className="relative group cursor-pointer w-full">
                        <div className="bg-white dark:bg-[#1a2c20] p-8 rounded-2xl shadow-lg border-2 border-[#13ec5b]/20 flex flex-col items-center relative z-10 transform hover:-translate-y-2 transition-transform h-full">
                            <span className="absolute -top-6 text-5xl drop-shadow-lg">👑</span>
                            <div className="relative mb-4 mt-2">
                                <div className="w-24 h-24 rounded-full border-4 border-[#13ec5b] overflow-hidden ring-4 ring-[#13ec5b]/20 shadow-xl shadow-[#13ec5b]/20">
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcJx8da7BY2kQsAXNWXcgAf_2nCirpYxpSiHg0mUgOc23Y0ZV9CqIpaTMyqb4-WLqzkx950wMi-s6qxbHHtIcEDEWaUpN9uGIhJZ68ZjLZQ0SrUzPe-lN1-NkZhUigLG-nswWWWTReoWWc1qZ6lHN10zb-J3GPT8aDxU-jYjRMcJX8lCbhfbNnqoEf2KbGnOeQRjd0gwCdvnDCkEXSSnlUjrArkP-V0IL-7iM2XVutP4rwdR4bLTbcNvWNp-ZA1kcK15n19kZvPbI')" }}></div>
                                </div>
                                <div className="absolute -bottom-3 -right-2 bg-[#13ec5b] text-[#0d1b12] w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 border-white dark:border-[#1a2c20]">1</div>
                            </div>
                            <h3 className="font-bold text-xl text-[#0d1b12] dark:text-white">Ricardo Oliveira</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Atacante</p>
                            <div className="flex gap-6 text-center w-full justify-center border-t border-[#f0f7f2] dark:border-[#2a4535] pt-4 bg-[#13ec5b]/5 dark:bg-[#13ec5b]/5 rounded-b-lg -mx-8 -mb-8 pb-4 mt-auto">
                                <div className="pt-2">
                                    <div className="text-xs text-gray-400 uppercase font-semibold">Gols</div>
                                    <div className="font-bold text-xl text-[#0d1b12] dark:text-white">24</div>
                                </div>
                                <div className="pt-2">
                                    <div className="text-xs text-gray-400 uppercase font-semibold">Nota</div>
                                    <div className="font-bold text-xl text-[#0ea841] dark:text-[#13ec5b]">9.4</div>
                                </div>
                                <div className="pt-2">
                                    <div className="text-xs text-gray-400 uppercase font-semibold">Jogos</div>
                                    <div className="font-bold text-xl text-[#0d1b12] dark:text-white">12</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 flex flex-col items-center">
                    <div className="relative group cursor-pointer w-full">
                        <div className="bg-white dark:bg-[#1a2c20] p-6 rounded-2xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] flex flex-col items-center relative z-10 transform hover:-translate-y-1 transition-transform">
                            <div className="relative mb-3">
                                <div className="w-20 h-20 rounded-full border-4 border-amber-600 dark:border-amber-700 overflow-hidden">
                                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxLiVWY84aKWGAm4RMBQTgLTij-0pZ6ddzBXEPCrA-2_xjIvlRWrO-ZILpb-TVCgjiboDQ0lzSc1OiSP7Tj3JYEqHpsUFWJnftY4baeERAV5tfFeTXaIZW8OM0tvfFSxdP2c-03hIVBb06pw5uYP7O3X5L6MSTOmr-_tUCGcRpJLZmcyCXy06jZYFTyYJ__ebMBUQeYuYXnYIe_7TP-Gk6Baxwvy8Scd9OrIgLHa0hhAPp2SOQssmWwo9COT9prGvc1v5yxjCQPqE')" }}></div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-amber-600 dark:bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white dark:border-[#1a2c20]">3</div>
                            </div>
                            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">João Mendes</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Zagueiro</p>
                            <div className="flex gap-4 text-center w-full justify-center border-t border-[#f0f7f2] dark:border-[#2a4535] pt-3">
                                <div>
                                    <div className="text-xs text-gray-400 uppercase">Gols</div>
                                    <div className="font-bold text-gray-700 dark:text-gray-300">5</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 uppercase">Nota</div>
                                    <div className="font-bold text-[#13ec5b]">8.5</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white dark:bg-[#1a2c20] rounded-xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] overflow-hidden">
                <div className="p-6 border-b border-[#e7f3eb] dark:border-[#2a4535] flex justify-between items-center bg-gray-50/50 dark:bg-[#22382b]/30">
                    <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Classificação Geral</h3>
                    <button className="text-sm text-[#13ec5b] font-bold hover:underline">Ver relatório completo</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#22382b]/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold border-b border-[#e7f3eb] dark:border-[#2a4535]">
                                <th className="px-6 py-4 text-center w-16">#</th>
                                <th className="px-6 py-4">Jogador</th>
                                <th className="px-6 py-4 text-center">Partidas</th>
                                <th className="px-6 py-4 text-center">Gols</th>
                                <th className="px-6 py-4 text-center">Assist.</th>
                                <th className="px-6 py-4 text-center">Vencidas</th>
                                <th className="px-6 py-4 text-center">Nota</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e7f3eb] dark:divide-[#2a4535] text-sm">
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                <td className="px-6 py-4 text-center font-bold text-gray-500">4</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSUAPXY1gOrqP8ks4O9zkCtRHqdoL-tr9RKHRSx6g25EFibZHR2dAIqz-LWWFBFHFx2RjkvEi1a5AT5CvyMIrU_gRWuvkTUyFgXvygTRbs5FFpvzMbtkg6csgAA1UlLbJ9tJEdV_1QiQA2RUDPTmYithzoPe1FDHYGGu_HhAY3T4u9qFIdaxxQ-6SkVz2QoWS8FcGItOUbqjKgTFeoFEVB34k8YZoScC_MGaYaFZ4V-V-wBfPS_lq0xCW3elO92kS1UZp1c8ShtYU')" }}></div>
                                        <div>
                                            <p className="font-bold text-[#0d1b12] dark:text-white group-hover:text-[#13ec5b] transition-colors">Lucas Ferreira</p>
                                            <p className="text-xs text-gray-500">Goleiro</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">15</td>
                                <td className="px-6 py-4 text-center font-medium">1</td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">2</td>
                                <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">10</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 bg-[#e7f3eb] dark:bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] px-2 py-1 rounded-md text-xs font-bold">
                                        8.2 <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                <td className="px-6 py-4 text-center font-bold text-gray-500">5</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCo2p3Kar5s1kSoIoFj_4NR-_3aIZZzf76eR9gX3UXwhQf8XKGpP5wTO42xTt-WdMLOUQR7YCX50uOhuNPdbiKNxNh-mMpfQay7dcimMn1JWUShUUYCT6bZ7bUJ3ZmmFwfZyg3RC8LuxCr6xoumIWdk8W-9dmdXxAPlJgDnBbwmMSs5eQBNUJanWsap8brN_NCAJ03EemZRoi9wb0uHErwXQtfC_V1kfq3Z_NT83EWNI-hEOBlQU_1vY7TzNHSC0EeYRscpWSIliPw')" }}></div>
                                        <div>
                                            <p className="font-bold text-[#0d1b12] dark:text-white group-hover:text-[#13ec5b] transition-colors">Felipe Santos</p>
                                            <p className="text-xs text-gray-500">Volante</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">14</td>
                                <td className="px-6 py-4 text-center font-medium">6</td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">8</td>
                                <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">9</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 bg-[#e7f3eb] dark:bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] px-2 py-1 rounded-md text-xs font-bold">
                                        8.0 <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </span>
                                </td>
                            </tr>
                            {/* User Highlighted Row */}
                            <tr className="bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors border-l-4 border-yellow-400">
                                <td className="px-6 py-4 text-center font-bold text-yellow-700 dark:text-yellow-500">6</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-cover ring-2 ring-yellow-400" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCO_ZFRgKLmrolcI_Yd0bMbCuVrOdW7zTaGcY5PgN1wpJwpxNxPjqcCQDwO3fMQlccaH4xafIX1cQxDfHOlNxNyDJG_flVWwTr59dtYSUSvUD-uU0UaxYKVdk0aMiN4363bYgpEcBDlOb37KIWtvwSNJiRbjPD4qQ89132QbYUWL7tG-PSpU1-wfNOXsu0Y3o5YZt6W3L5YKCs0SFO6ymRPu4TqoKQuvnISxpbkqBknD7ob8l7euQhHbUcoRlrmUdN_0FOxF1EVUWs')" }}></div>
                                        <div>
                                            <p className="font-bold text-[#0d1b12] dark:text-white">Você (Ericlei)</p>
                                            <p className="text-xs text-gray-500">Lateral</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">12</td>
                                <td className="px-6 py-4 text-center font-medium">3</td>
                                <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">5</td>
                                <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">7</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-md text-xs font-bold">
                                        7.8 <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-[#22382b]/30 transition-colors group">
                                <td className="px-6 py-4 text-center font-bold text-gray-500">7</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCM-aVQlQnFNaAD5Qy_br21zhkvnDlLv37jujEvtbnUUFAvf1EnQuPU1Tf-xhqK4KI6jBbBrjIzTCk7ycB3i6CTZCEDid9OsRohfhFFN0yKr31VDLhBjwbYUk56DS2TN-IQ4T8neKqoxnbjZx70HnAOITIvf4MMFaBE5ahye3OHu-EX-hrNmH1-tnlvz56gTTwnTL5DFw1qGrnxl3L5o7MbXBqtn4A4jhGudDSAGvgMkoPdWFm1hGk1-CSAPKtzo0-SBbwShuro9bQ')" }}></div>
                                        <div>
                                            <p className="font-bold text-[#0d1b12] dark:text-white group-hover:text-[#13ec5b] transition-colors">Bruno Costa</p>
                                            <p className="text-xs text-gray-500">Atacante</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">10</td>
                                <td className="px-6 py-4 text-center font-medium">9</td>
                                <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">1</td>
                                <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-medium">4</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-[#2a4535]/50 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-bold">
                                        7.5 <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-[#e7f3eb] dark:border-[#2a4535] flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Mostrando 1 a 8 de 24 jogadores</span>
                    <div className="flex gap-2">
                        <button className="size-8 flex items-center justify-center rounded-lg border border-[#e7f3eb] dark:border-[#2a4535] hover:bg-gray-50 dark:hover:bg-[#22382b] disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button className="size-8 flex items-center justify-center rounded-lg bg-[#13ec5b] text-[#0d1b12] font-bold shadow-sm">1</button>
                        <button className="size-8 flex items-center justify-center rounded-lg border border-[#e7f3eb] dark:border-[#2a4535] hover:bg-gray-50 dark:hover:bg-[#22382b]">2</button>
                        <button className="size-8 flex items-center justify-center rounded-lg border border-[#e7f3eb] dark:border-[#2a4535] hover:bg-gray-50 dark:hover:bg-[#22382b]">3</button>
                        <button className="size-8 flex items-center justify-center rounded-lg border border-[#e7f3eb] dark:border-[#2a4535] hover:bg-gray-50 dark:hover:bg-[#22382b]">
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#1a2c20] p-4 rounded-xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">sports_soccer</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Total de Gols</p>
                        <h4 className="text-xl font-black text-[#0d1b12] dark:text-white">342</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2c20] p-4 rounded-xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">timer</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Partidas Jogadas</p>
                        <h4 className="text-xl font-black text-[#0d1b12] dark:text-white">48</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2c20] p-4 rounded-xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] flex items-center gap-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                        <span className="material-symbols-outlined">local_fire_department</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Maior Sequência</p>
                        <h4 className="text-xl font-black text-[#0d1b12] dark:text-white">7 vitórias</h4>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2c20] p-4 rounded-xl shadow-sm border border-[#e7f3eb] dark:border-[#2a4535] flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-[#0ea841] dark:text-[#13ec5b]">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Média do Grupo</p>
                        <h4 className="text-xl font-black text-[#0d1b12] dark:text-white">7.4</h4>
                    </div>
                </div>
            </div>

            <div className="h-4"></div>
        </div>
    );
}
