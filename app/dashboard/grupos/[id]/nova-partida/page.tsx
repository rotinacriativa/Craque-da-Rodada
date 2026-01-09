"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "../../../../components/AddressAutocomplete";
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
    const [formData, setFormData] = useState({
        date: "",
        dayOfWeek: "Selecione o dia",
        startTime: "",
        endTime: "",
        gender: "Selecione",
        location: "",
        lat: "",
        lon: "",
        capacity: "",
        price: "",
    });

    // Auth Loading State
    if (authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f6f8f6] dark:bg-[#102216]">
                <div className="flex flex-col items-center gap-4">
                    <span className="size-10 block rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-[#13ec5b] animate-spin"></span>
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    // Auth Guard
    if (!isAuthorized) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-update day of week if date changes
        if (name === "date") {
            const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
            const date = new Date(value);
            const dayName = days[date.getDay()];
            if (!isNaN(date.getTime())) {
                setFormData(prev => ({ ...prev, dayOfWeek: dayName, [name]: value }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!formData.date || !formData.startTime || !formData.endTime || !formData.location || !formData.capacity || !formData.price || formData.gender === "Selecione") {
                alert("Por favor, preencha todos os campos obrigatórios.");
                setIsLoading(false);
                return;
            }

            const matchName = `Futebol de ${new Date(formData.date).toLocaleDateString('pt-BR', { weekday: 'long' })} - ${formData.gender}`;

            const { error } = await supabase
                .from('matches')
                .insert([
                    {
                        group_id: groupId,
                        name: matchName,
                        date: formData.date,
                        start_time: formData.startTime,
                        end_time: formData.endTime,
                        location: formData.location,
                        latitude: formData.lat ? parseFloat(formData.lat) : null,
                        longitude: formData.lon ? parseFloat(formData.lon) : null,
                        capacity: parseInt(formData.capacity),
                        price: parseFloat(formData.price.replace(',', '.')),
                        gender: formData.gender
                    }
                ]);

            if (error) throw error;

            // Redirect to group dashboard
            router.push(`/dashboard/grupos/${groupId}`);
            router.refresh();

        } catch (error) {
            console.error("Error creating match:", error);
            alert("Erro ao criar partida. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] relative min-h-screen">
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-10 relative">
                {/* Background Decor */}
                <div className="absolute top-10 right-10 opacity-10 dark:opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[200px] text-[#13ec5b]">sports_soccer</span>
                </div>
                <div className="absolute bottom-10 left-10 opacity-10 dark:opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[150px] text-[#13ec5b]">stadium</span>
                </div>

                <div className="w-full max-w-[720px] flex flex-col mb-10 md:mb-0 relative z-10">
                    <Link
                        href={`/dashboard/grupos/${groupId}`}
                        className="self-start flex items-center gap-2 text-slate-500 hover:text-[#13ec5b] text-sm font-bold mb-6 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        Voltar para o Grupo
                    </Link>

                    <div className="bg-white dark:bg-[#1a2c20] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden border border-slate-100 dark:border-slate-800">
                        {/* Form Header */}
                        <div className="bg-[#13ec5b] p-8 md:p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <h1 className="text-3xl md:text-4xl font-black text-[#0d1b12] mb-2 tracking-tight">Nova Partida</h1>
                                <p className="text-[#0d1b12]/80 font-medium">Preencha os dados abaixo para agendar o próximo jogo.</p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="p-8 md:p-10 flex flex-col gap-6">

                            {/* Date, Day, Times */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data do Jogo</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dia da Semana</label>
                                    <input
                                        type="text"
                                        name="dayOfWeek"
                                        value={formData.dayOfWeek}
                                        readOnly
                                        disabled
                                        className="w-full bg-slate-100 dark:bg-[#102216]/50 border-2 border-transparent rounded-xl px-4 py-3 text-slate-500 font-bold outline-none cursor-not-allowed uppercase"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Início</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fim</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Gender & Capacity */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidade</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors appearance-none"
                                        required
                                    >
                                        <option disabled>Selecione</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Misto">Misto</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vagas (Máx)</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        placeholder="Ex: 24"
                                        className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Location (Autocomplete) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Local da Partida</label>
                                <AddressAutocomplete
                                    onSelect={(address, lat, lon) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            location: address,
                                            lat: lat || "",
                                            lon: lon || ""
                                        }));
                                    }}
                                    onChange={(value) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            location: value,
                                            // Keep existing lat/lon or clear them? 
                                            // If user types, we probably shouldn't rely on old coordinates unless they select again.
                                            // But for now let's just update the text so validation passes.
                                            lat: "",
                                            lon: ""
                                        }));
                                    }}
                                    value={formData.location}
                                    placeholder="Digite o nome do campo, quadra ou endereço..."
                                    className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors"
                                />
                            </div>

                            {/* Price */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preço por Pessoa</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                    <input
                                        type="text"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0,00"
                                        className="w-full bg-slate-50 dark:bg-[#102216] border-2 border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:border-[#13ec5b] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 w-full bg-[#13ec5b] hover:bg-[#0fd652] text-[#0d1b12] text-lg font-black py-4 rounded-xl shadow-lg shadow-[#13ec5b]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
                            >
                                {isLoading ? "Criando partida..." : "Agendar Partida"}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
