"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AddressAutocomplete from "../../../../components/AddressAutocomplete";
import MapSelectorModal from "../../../../components/MapSelectorModal";
import { supabase } from "../../../../../src/lib/client";
import { AdminProvider, useAdmin } from "../admin/AdminContext";

export default function CreateMatchWrapper({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <AdminProvider groupId={id}>
            <CreateMatchContent />
        </AdminProvider>
    );
}

function CreateMatchContent() {
    const { groupId, isLoading: authLoading, isAuthorized } = useAdmin();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    // Core Form Data
    const [formData, setFormData] = useState({
        date: "",
        time: "",
        category: "Society",
        location: "",
        lat: "",
        lon: "",
        capacity: "14", // Default from mockup
        price: "25,00", // Default from mockup
    });

    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceConfig, setRecurrenceConfig] = useState({
        frequency: "Semanalmente",
        endDate: "",
        autoOpenDays: "3",
        selectedDays: [] as string[]
    });

    // Map State
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Auth Loading State
    if (authLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
            </div>
        );
    }

    // Auth Guard
    if (!isAuthorized) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRecurrenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRecurrenceConfig(prev => ({ ...prev, [name]: value }));
    };

    const toggleDay = (day: string) => {
        setRecurrenceConfig(prev => {
            const days = prev.selectedDays.includes(day)
                ? prev.selectedDays.filter(d => d !== day)
                : [...prev.selectedDays, day];
            return { ...prev, selectedDays: days };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.date || !formData.time || !formData.location || !formData.capacity) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                setIsLoading(false);
                return;
            }

            // Estimate End Time (default 1.5h duration)
            const [hours, minutes] = formData.time.split(':').map(Number);
            const endTimeDate = new Date();
            endTimeDate.setHours(hours + 1);
            endTimeDate.setMinutes(minutes + 30);
            const endTime = `${String(endTimeDate.getHours()).padStart(2, '0')}:${String(endTimeDate.getMinutes()).padStart(2, '0')}`;

            const matchName = `Futebol ${formData.category} - ${new Date(formData.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}`;

            // Build Payload
            const payload = {
                group_id: groupId,
                name: matchName,
                date: formData.date,
                start_time: formData.time,
                end_time: endTime, // Estimated
                location: formData.location,
                latitude: formData.lat ? parseFloat(formData.lat) : null,
                longitude: formData.lon ? parseFloat(formData.lon) : null,
                capacity: parseInt(formData.capacity),
                price: parseFloat(formData.price.replace(',', '.')),
                gender: "Misto", // Simplified for now or add to form if needed
            };

            const { error } = await supabase
                .from('matches')
                .insert([payload]);

            if (error) throw error;

            toast.success('Jogo marcado! A convocação começou. 📣');

            // Redirect
            router.push(`/dashboard/grupos/${groupId}`);
            router.refresh();

        } catch (error: any) {
            console.error("Error creating match:", error);
            const msg = "Erro ao criar partida: " + error.message;
            alert(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Map State

    const handleMapSelect = (data: { lat: number; lon: number; address: string }) => {
        setFormData(prev => ({
            ...prev,
            location: data.address,
            lat: data.lat.toString(),
            lon: data.lon.toString()
        }));
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] relative min-h-screen font-sans">

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 pb-24">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 pt-4">
                    <Link href={`/dashboard/grupos/${groupId}`} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#13ec5b] transition-colors shadow-sm">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Marcar Jogo</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Agende o próximo jogo da galera</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a2e22] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Main Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-8">

                        {/* Date & Time Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Data do Jogo</span>
                                <div className="relative flex items-center">
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">calendar_today</span>
                                </div>
                            </label>
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Horário</span>
                                <div className="relative flex items-center">
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">schedule</span>
                                </div>
                            </label>
                        </div>

                        {/* Recurrence Section */}
                        <div className="w-full">
                            <input
                                className="peer sr-only"
                                id="recurrence-toggle"
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                            />
                            <label className="inline-flex items-center cursor-pointer select-none group" htmlFor="recurrence-toggle">
                                <div className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${isRecurring ? 'bg-[#13ec5b]' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <div className={`absolute top-[2px] left-[2px] h-6 w-6 bg-white border border-gray-300 rounded-full transition-transform duration-200 ${isRecurring ? 'translate-x-[20px] border-white' : 'translate-x-0'}`}></div>
                                </div>
                                <span className={`ml-3 font-bold transition-colors ${isRecurring ? 'text-[#13ec5b]' : 'text-slate-700 dark:text-slate-300'}`}>Partida Recorrente</span>
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#13ec5b]/10 text-[#0ea841] dark:text-[#13ec5b] text-[10px] font-bold uppercase tracking-wide">Novo</span>
                            </label>

                            <div className="hidden peer-checked:grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mt-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 border-l-[#13ec5b] shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="col-span-1 md:col-span-2">
                                    <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-1">Configuração de Recorrência</h4>
                                </div>
                                <label className="flex flex-col gap-2 group">
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1 text-sm">Repetir</span>
                                    <div className="relative flex items-center">
                                        <select
                                            name="frequency"
                                            value={recurrenceConfig.frequency}
                                            onChange={handleRecurrenceChange}
                                            className="w-full h-12 pl-10 pr-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium appearance-none"
                                        >
                                            <option>Semanalmente</option>
                                            <option>Quinzenalmente</option>
                                            <option>Mensalmente</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute left-3 text-[#13ec5b] pointer-events-none text-[20px]">loop</span>
                                        <span className="material-symbols-outlined absolute right-3 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </label>
                                {/* 'Termina em' field removed as requested */}

                                <label className="col-span-1 md:col-span-2 flex flex-col gap-2 group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1 text-sm">Abrir lista automaticamente</span>
                                        <span className="text-xs text-[#13ec5b] font-bold bg-[#13ec5b]/10 px-2 py-0.5 rounded-full">Automático</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <select
                                            name="autoOpenDays"
                                            value={recurrenceConfig.autoOpenDays}
                                            onChange={handleRecurrenceChange}
                                            className="w-full h-12 pl-10 pr-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium appearance-none"
                                        >
                                            <option value="1">1 dia antes do jogo</option>
                                            <option value="2">2 dias antes do jogo</option>
                                            <option value="3">3 dias antes do jogo</option>
                                            <option value="4">4 dias antes do jogo</option>
                                            <option value="5">5 dias antes do jogo</option>
                                            <option value="7">1 semana antes do jogo</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute left-3 text-[#13ec5b] pointer-events-none text-[20px]">timer</span>
                                        <span className="material-symbols-outlined absolute right-3 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-1 mt-1">A lista de presença será liberada aos jogadores neste período.</p>
                                </label>
                                <div className="col-span-1 md:col-span-2 pt-2">
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1 text-sm block mb-3">Dias da semana</span>
                                    <div className="flex flex-wrap gap-3">
                                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => toggleDay(String(i))}
                                                className={`w-10 h-10 rounded-full font-bold transition-all border-2 
                                            ${recurrenceConfig.selectedDays.includes(String(i))
                                                        ? 'bg-[#13ec5b] text-[#0d1b12] border-[#13ec5b] shadow-md shadow-[#13ec5b]/20'
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}`
                                                }
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">info</span>
                                        O sistema criará novas partidas automaticamente baseado na regra.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Category & Location */}
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <label className="md:col-span-1 flex flex-col gap-2 group">
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Categoria</span>
                                    <div className="relative flex items-center">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="Society">Society</option>
                                            <option value="Futsal">Futsal</option>
                                            <option value="Campo">Campo</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">sports_soccer</span>
                                        <span className="material-symbols-outlined absolute right-4 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </label>
                                {/* Local / Quadra Section */}
                                <div className="col-span-1 md:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Local / Quadra</h3>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-[#15231a] p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <AddressAutocomplete
                                            onSelect={(addr, lat, lon) => setFormData(prev => ({ ...prev, location: addr, lat: lat || "", lon: lon || "" }))}
                                            value={formData.location}
                                            onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                                            placeholder="Busque por nome, rua ou estabelecimento..."
                                            className="w-full h-12 pl-12 pr-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                                        />
                                    </div>

                                    {/* Map Trigger */}
                                    <div
                                        onClick={() => setIsMapOpen(true)}
                                        className="relative h-32 w-full rounded-xl overflow-hidden cursor-pointer group border-2 border-slate-200 dark:border-slate-700 hover:border-[#13ec5b] transition-all"
                                    >
                                        <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700">
                                            {/* Static Map Background Pattern (CSS or Image) */}
                                            <div className="opacity-30 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/map-light.png')]"></div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                                            <div className="bg-white dark:bg-[#1a2e22] px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
                                                <span className="material-symbols-outlined text-[#13ec5b]">map</span>
                                                <span className="font-bold text-slate-700 dark:text-white text-sm">Selecionar no mapa</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capacity & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Limite de Jogadores (Vagas)</span>
                                <div className="relative flex items-center">
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium"
                                        min="10"
                                        max="50"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">groups</span>
                                    <div className="absolute right-4 flex gap-1 pointer-events-none text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Jogadores
                                    </div>
                                </div>
                            </label>
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Valor por Pessoa</span>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">attach_money</span>
                                    <div className="absolute right-4 text-slate-400 font-bold">R$</div>
                                </div>
                            </label>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse md:flex-row gap-4 md:items-center justify-end">
                            <Link
                                href={`/dashboard/grupos/${groupId}`}
                                className="px-8 py-4 rounded-full text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative px-8 py-4 bg-[#13ec5b] hover:bg-[#0fd652] active:scale-[0.98] rounded-full text-[#0d1b12] font-bold shadow-lg shadow-[#13ec5b]/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{isLoading ? "Criando..." : "Marcar Jogo"}</span>
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                        </div>
                    </form>

                    <div className="text-center text-slate-400 text-sm pb-8">
                        <p>O convite será enviado automaticamente para o grupo do WhatsApp.</p>
                    </div>
                </div>
            </main>

            {/* Map Modal */}
            <MapSelectorModal
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelect={handleMapSelect}
                initialLat={formData.lat ? parseFloat(formData.lat) : null}
                initialLon={formData.lon ? parseFloat(formData.lon) : null}
            />
        </div>
    );
}
