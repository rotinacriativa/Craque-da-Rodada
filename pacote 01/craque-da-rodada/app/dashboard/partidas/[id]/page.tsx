"use client";

import Link from "next/link";
import { useState, use } from "react";

export default function MatchDetails({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const matchId = id;
    const [status, setStatus] = useState<"confirming" | "confirmed" | null>(null);

    const handleConfirm = () => {
        setStatus("confirming");
        setTimeout(() => setStatus("confirmed"), 1000); // Simulate API call
    };

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#13ec5b]/20 px-3 py-1 text-sm font-bold text-green-800 dark:text-green-300">
                                <span className="size-2 rounded-full bg-[#13ec5b] animate-pulse"></span>
                                Vagas Abertas
                            </span>
                            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Competitivo
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-[#0d1b12] dark:text-white mb-2">
                                Pelada de Terça - Arena Point
                            </h1>
                            <p className="text-lg md:text-xl text-[#4c9a66] dark:text-[#13ec5b] font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined">calendar_month</span>
                                Segunda-feira, 24 de Outubro • 20:00 - 22:00
                            </p>
                        </div>
                    </div>

                    {/* Location Card */}
                    <section className="rounded-2xl overflow-hidden border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-sm">
                        <div className="h-48 w-full bg-gray-200 relative">
                            {/* Map Placeholder */}
                            <div className="absolute inset-0 bg-cover bg-center opacity-80"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXN2pk8LXHs1dsBLfAhgFB3zKlTTOOymcoK9-htdI6HJe7H_tFy3FbZy719E3qzsI-He-8AQwruCn5QbrQJ7SxwfefiaS04MlhIsAVPnOVYNabWFI6V45Wcs36gRxsCgZaPXs6zZmGFDTXEr5Vf_0YlWd3YotfGAOZiy0Ol2bt_4qg5e9p702ISVP8a_Iy9cWU3QLsBvrgSj1PG5OYJ1hOPgv27H0Ul9GyDljiyNB9jfQf2TdoORZL8uPnfPumx8pclO8jzirPwIY')" }}>
                            </div>
                            <button className="absolute bottom-4 right-4 bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                <span className="material-symbols-outlined text-[#13ec5b]">map</span>
                                Ver no Mapa
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-1 text-[#0d1b12] dark:text-white">Arena Soccer Point</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">Rua das Flores, 123 - Centro. Campo Society 7.</p>
                                    {/* Amenities */}
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#13ec5b]">local_parking</span>
                                            Estacionamento
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#13ec5b]">shower</span>
                                            Vestiário
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-lg">
                                            <span className="material-symbols-outlined text-[#13ec5b]">sports_bar</span>
                                            Bar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Roster Section */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#0d1b12] dark:text-white">Quem vai jogar</h2>
                            <div className="flex bg-gray-100 dark:bg-[#183020] p-1 rounded-full">
                                <button className="px-4 py-1.5 rounded-full bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white shadow-sm text-sm font-bold">Confirmados (12)</button>
                                <button className="px-4 py-1.5 rounded-full text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-[#0d1b12] dark:hover:text-white transition-colors">Espera (0)</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Organizer Card */}
                            <div className="flex items-center p-3 gap-3 rounded-xl bg-[#13ec5b]/10 border border-[#13ec5b]/20">
                                <div className="relative">
                                    <div className="size-12 rounded-full bg-gray-300 bg-cover bg-center border-2 border-white dark:border-[#102216]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8yDXKUjUPl4l1CmkrintPceWHlOfhy8hN7APbdMYU9DETHkZlq2bvxKObjZ1VBI2ErrxAR6EoaeQzGFNIh_oJ4Gx5_PCmMCE0-E6eLcyBXihXMmFeZXm98ZsO0CviRl9MbyoQ6atXPDhDMB4xpiXRbIHeyWPSzRwMJ9HYwOQDJh9UMZZUBmuMyV7tXg_zdlNrJKgIdthiNcIFrh4d0cAVUfiuekCTdspkQIAqKFZnvJUy_wGfRFziP4qZNYnirsjxbpgw675eo8c')" }}></div>
                                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black p-0.5 rounded-full border-2 border-white dark:border-[#102216]">
                                        <span className="material-symbols-outlined text-[12px] block font-bold">star</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#0d1b12] dark:text-white">Carlos Silva</p>
                                    <p className="text-xs font-bold text-[#0ea841] dark:text-[#13ec5b] uppercase tracking-wide">Organizador</p>
                                </div>
                            </div>
                            {/* Regular Player 1 */}
                            <div className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <div className="size-12 rounded-full bg-gray-300 bg-cover bg-center border-2 border-white dark:border-[#102216]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaOLueCTB8m4zg9PunhpVeMtPhoHtNMsc_-BbDnYllppggqNVChvMfeOeTAaZKz2_PqfC_ubJLemBFrIVDVflYNqTQ94TvNiBi6ne9zoxYJpAxQdvOYZrSm33Q9oPUY1ZmBAbam91Xu26w7pELfbSQxBF2DC-yF3NywFUtttK2f1wpTL-rpITX4qCEbpRFIP_HdM0sqf4VXyODi_b7pI0MLOENWpXH_Pu2NguZQBDX5pu7sMSFjGQcAcFtFx8z35ONi3tu7Vehtw8')" }}></div>
                                    <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] p-0.5 rounded-full border-2 border-white dark:border-[#102216]">
                                        <span className="material-symbols-outlined text-[12px] block font-bold">check</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#0d1b12] dark:text-white">André Santos</p>
                                    <p className="text-xs text-gray-500">Zagueiro</p>
                                </div>
                            </div>
                            {/* Regular Player 2 */}
                            <div className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <div className="size-12 rounded-full bg-gray-300 bg-cover bg-center border-2 border-white dark:border-[#102216]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbP8E_ASGWUMZn3djg4gnANrsBYhK4GWiAWjqBmQMn9J1xP8zwiru6--JiaNsVytoKzeLEhNxtir5CNi6xd499KyIaPmotU2Mp_gXx-iyG6IpaPBoWsFzdaLx7d1HryayhGfCNukMqnGcMj75wFJ9-Sd_R4d7fJ7ANmIQ5RekBKasOgUyrEKEsuNL3tTBVxFzGDIXVo0jBY1f6bsbXmmCibYLrH0fkc2FGxrV7b7CJWvq6105vyKw0ds652xoYu0t1-DHgwPqzP-0')" }}></div>
                                    <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] p-0.5 rounded-full border-2 border-white dark:border-[#102216]">
                                        <span className="material-symbols-outlined text-[12px] block font-bold">check</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#0d1b12] dark:text-white">Mariana Costa</p>
                                    <p className="text-xs text-gray-500">Meia</p>
                                </div>
                            </div>
                            {/* Regular Player 3 */}
                            <div className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <div className="size-12 rounded-full bg-gray-300 bg-cover bg-center border-2 border-white dark:border-[#102216]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuWjwCd81O_u8vBkUOVCTTgIsTwO0lEMnAEw5RBlMsQDiX6c5uXs98zpvGKAVZ8KiDug2LGS8dWCrqAXxY015F_2s7b4NUu2UWbzwN1c6Y44BVBLXSLjdQ_K_z03Mj83EEA2wer7iJu3fTx-Yzqtuc-qCh_ejmRaGgTQ1VpgHlqbg2rxMmXBt1eC5HvsV6rCEtKCxcobTWyQO5FDWxjxlA4bUhdJjxPR569i__cXkVSoKNsPyQIsD4h2pxl0emDGGd7johBuiy9dM')" }}></div>
                                    <div className="absolute -bottom-1 -right-1 bg-[#13ec5b] text-[#0d1b12] p-0.5 rounded-full border-2 border-white dark:border-[#102216]">
                                        <span className="material-symbols-outlined text-[12px] block font-bold">check</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#0d1b12] dark:text-white">João Pedro</p>
                                    <p className="text-xs text-gray-500">Goleiro</p>
                                </div>
                            </div>
                            {/* Additional placeholder players */}
                            <div className="flex items-center p-3 gap-3 rounded-xl bg-white dark:bg-[#183020] border border-gray-100 dark:border-gray-800 opacity-60">
                                <div className="size-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm">
                                    +8
                                </div>
                                <div>
                                    <p className="font-bold text-[#0d1b12] dark:text-white">Outros jogadores</p>
                                    <p className="text-xs text-gray-500">Ver lista completa</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Sticky Action Card (Span 4) */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-24 flex flex-col gap-6">
                        {/* Status/Action Card */}
                        <div className="rounded-2xl border border-[#e7f3eb] dark:border-[#1f3b28] bg-white dark:bg-[#183020] shadow-xl shadow-green-900/5 p-6 flex flex-col gap-6">
                            {/* Vacancy Info */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                                    <span className="text-sm font-bold text-[#0d1b12] dark:text-white">Confirmado 12/14</span>
                                </div>
                                <div className="w-full h-3 bg-[#e7f3eb] dark:bg-[#102216] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#13ec5b] rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                                </div>
                                <div className="flex items-center gap-2 text-[#4c9a66] dark:text-[#13ec5b] text-sm font-medium mt-1">
                                    <span className="material-symbols-outlined text-lg">bolt</span>
                                    Restam apenas 2 vagas!
                                </div>
                            </div>
                            <hr className="border-[#e7f3eb] dark:border-white/10" />
                            {/* Cost Info */}
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Custo por pessoa</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-[#0d1b12] dark:text-white">R$ 25</span>
                                        <span className="text-sm font-bold text-gray-400">,00</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-400">Pagamento via App</span>
                                </div>
                            </div>
                            {/* Main Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirm}
                                    disabled={status === "confirmed"}
                                    className={`group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 ${status === "confirmed" ? "bg-green-700 cursor-default" : "bg-[#13ec5b] hover:shadow-green-400/40 hover:scale-[1.02]"} text-[#0d1b12] text-lg font-bold shadow-lg shadow-green-400/20 transition-all`}
                                >
                                    {!status && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                                    <span className="relative flex items-center gap-2">
                                        {status === "confirming" ? "Confirmando..." : status === "confirmed" ? "Presença Confirmada!" : "Confirmar Presença"}
                                        {!status && <span className="material-symbols-outlined">arrow_forward</span>}
                                        {status === "confirmed" && <span className="material-symbols-outlined">check</span>}
                                    </span>
                                </button>
                                <button className="w-full h-12 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    Não posso ir
                                </button>
                            </div>
                            {/* Footer note */}
                            <p className="text-xs text-center text-gray-400 dark:text-gray-500 leading-relaxed">
                                Ao confirmar, você concorda com as regras de cancelamento (24h antes).
                            </p>
                        </div>
                        {/* Quick Share */}
                        <div className="p-4 rounded-2xl bg-[#13ec5b]/10 border border-[#13ec5b]/20 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-[#0d1b12] dark:text-white text-sm">Convide amigos</span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">Faltam 2 goleiros!</span>
                            </div>
                            <button className="size-10 rounded-full bg-white dark:bg-[#102216] text-[#0d1b12] dark:text-white flex items-center justify-center shadow-sm hover:text-[#13ec5b] transition-colors">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
