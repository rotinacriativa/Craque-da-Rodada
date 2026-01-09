"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AddressAutocomplete from "../../../../components/AddressAutocomplete";
import MapSelectorModal from "../../../../components/MapSelectorModal";
import { supabase } from "../../../../../src/lib/client";

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const matchId = id;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [groupId, setGroupId] = useState<string | null>(null);

    // Core Form Data
    const [formData, setFormData] = useState({
        name: "", // Usually auto-generated but let's keep it in state if we want to allow custom names? Mockup logic was auto.
        date: "",
        time: "",
        category: "Society",
        location: "",
        lat: "",
        lon: "",
        capacity: "14",
        price: "25,00",
    });

    // Map State
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Fetch Match Data
    useEffect(() => {
        async function fetchMatch() {
            try {
                const { data: match, error } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('id', matchId)
                    .single();

                if (error) throw error;

                if (match) {
                    setGroupId(match.group_id);

                    // Parse date and time
                    // match.date is YYYY-MM-DD
                    // match.start_time is HH:MM:SS

                    let category = "Society";
                    if (match.name.includes("Futsal")) category = "Futsal";
                    if (match.name.includes("Campo")) category = "Campo";

                    setFormData({
                        name: match.name,
                        date: match.date,
                        time: match.start_time.slice(0, 5), // Remove seconds
                        category: category,
                        location: match.location || "",
                        lat: match.latitude ? String(match.latitude) : "",
                        lon: match.longitude ? String(match.longitude) : "",
                        capacity: String(match.capacity || 14),
                        price: match.price ? match.price.toFixed(2).replace('.', ',') : "0,00",
                    });
                }
            } catch (error) {
                console.error("Error fetching match:", error);
                toast.error("Erro ao carregar dados da partida.");
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        }

        if (matchId) {
            fetchMatch();
        }
    }, [matchId, router]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMapSelect = (data: { lat: number; lon: number; address: string }) => {
        setFormData(prev => ({
            ...prev,
            location: data.address,
            lat: data.lat.toString(),
            lon: data.lon.toString()
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (!formData.date || !formData.time || !formData.location || !formData.capacity) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                setIsSaving(false);
                return;
            }

            // Estimate End Time (default 1.5h duration)
            const [hours, minutes] = formData.time.split(':').map(Number);
            const endTimeDate = new Date();
            endTimeDate.setHours(hours + 1);
            endTimeDate.setMinutes(minutes + 30);
            const endTime = `${String(endTimeDate.getHours()).padStart(2, '0')}:${String(endTimeDate.getMinutes()).padStart(2, '0')}`;

            // Logic to update name based on date/category changes?
            // Or keep existing name if user customized it? 
            // For now, let's regenerate standard name to correspond to new date
            const weekday = new Date(formData.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' });
            const matchName = `Futebol ${formData.category} - ${weekday}`;

            const payload = {
                name: matchName,
                date: formData.date,
                start_time: formData.time,
                end_time: endTime,
                location: formData.location,
                latitude: formData.lat ? parseFloat(formData.lat) : null,
                longitude: formData.lon ? parseFloat(formData.lon) : null,
                capacity: parseInt(formData.capacity),
                price: parseFloat(formData.price.replace(',', '.')),
            };

            const { error } = await supabase
                .from('matches')
                .update(payload)
                .eq('id', matchId);

            if (error) throw error;

            toast.success('Partida atualizada com sucesso!');

            // Redirect back to match details, force refresh
            router.push(`/dashboard/partidas/${matchId}`);
            router.refresh();

        } catch (error: any) {
            console.error("Error updating match:", error);
            toast.error("Erro ao atualizar partida: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="size-10 block rounded-full border-4 border-[#13ec5b] border-r-transparent animate-spin"></span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] relative min-h-screen font-sans">
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 pb-24">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 pt-4">
                    <Link href={`/dashboard/partidas/${matchId}`} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-[#13ec5b] transition-colors shadow-sm">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Editar Partida</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Altere as informações do jogo</p>
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
                                href={`/dashboard/partidas/${matchId}`}
                                className="px-8 py-4 rounded-full text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="group relative px-8 py-4 bg-[#13ec5b] hover:bg-[#0fd652] active:scale-[0.98] rounded-full text-[#0d1b12] font-bold shadow-lg shadow-[#13ec5b]/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">check</span>
                            </button>
                        </div>
                    </form>
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
