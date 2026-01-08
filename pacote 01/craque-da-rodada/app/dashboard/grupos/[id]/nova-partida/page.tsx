"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/app/components/AddressAutocomplete";
import { supabase } from "@/src/lib/supabaseClient";

export default function CreateMatch({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: "",
        startTime: "",
        location: "",
        lat: "",
        lon: "",
        capacity: "14", // Default from visual
        price: "25,00", // Default from visual
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Basic validation
            if (!formData.date || !formData.startTime || !formData.location) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                setIsLoading(false);
                return;
            }

            // Derive name and end time (default 1h or 1.5h later?)
            // For now, simpler implementation as per design
            const matchName = `Futebol de ${new Date(formData.date).toLocaleDateString('pt-BR', { weekday: 'long' })}`;

            // Calculate end_time (defaulting to 1.5 hours after start_time)
            let endMatchTime = "00:00";
            if (formData.startTime) {
                const [hours, minutes] = formData.startTime.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes);
                date.setMinutes(date.getMinutes() + 90); // Add 90 minutes
                endMatchTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }

            const { error } = await supabase
                .from('matches')
                .insert([
                    {
                        group_id: groupId,
                        name: matchName,
                        date: formData.date,
                        start_time: formData.startTime,
                        end_time: endMatchTime,
                        location: formData.location,
                        latitude: formData.lat ? parseFloat(formData.lat) : null,
                        longitude: formData.lon ? parseFloat(formData.lon) : null,
                        capacity: parseInt(formData.capacity),
                        price: parseFloat(formData.price.replace(',', '.'))
                    }
                ]);

            if (error) throw error;

            alert("Partida criada com sucesso!");
            router.push(`/dashboard/grupos/${groupId}`);
        } catch (error) {
            console.error("Error creating match:", JSON.stringify(error, null, 2));
            alert("Erro ao criar partida. Verifique o console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 bg-[#f6f8f6] dark:bg-[#102216]">
            {/* Breadcrumbs / Top Bar */}
            <header className="w-full px-6 py-5 md:px-10 md:py-8">
                <div className="max-w-4xl mx-auto w-full">
                    <nav className="flex flex-wrap items-center gap-2 text-sm md:text-base">
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href="/dashboard">Dashboard</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <Link className="text-slate-400 hover:text-[#13ec5b] transition-colors font-medium" href={`/dashboard/grupos/${groupId}`}>Meu Grupo</Link>
                        <span className="material-symbols-outlined text-slate-300 text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium bg-white dark:bg-[#1a2c22] px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">Nova Partida</span>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 px-6 pb-12 md:px-10">
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Agendar Nova Pelada</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">Preencha os dados abaixo para convidar a galera.</p>
                        </div>
                        {/* Optional top action */}
                        <button className="hidden md:flex items-center gap-2 text-[#13ec5b] hover:text-[#0fd652] font-semibold bg-[#13ec5b]/10 px-4 py-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            <span>Ajuda</span>
                        </button>
                    </div>

                    {/* Main Form Card */}
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a2c22] p-6 md:p-8 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col gap-8">
                        {/* Row 1: Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Data do Jogo</span>
                                <div className="relative flex items-center">
                                    <input
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium appearance-none"
                                        type="date"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">calendar_today</span>
                                </div>
                            </label>
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Horário</span>
                                <div className="relative flex items-center">
                                    <input
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium appearance-none"
                                        type="time"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">schedule</span>
                                </div>
                            </label>
                        </div>

                        {/* Row 2: Location */}
                        <div className="grid grid-cols-1 gap-6">
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Local / Quadra</span>
                                <div className="relative flex items-center z-20">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                        <span className="material-symbols-outlined text-[#13ec5b]">location_on</span>
                                    </div>
                                    <AddressAutocomplete
                                        value={formData.location}
                                        onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                                        onSelect={(address, lat, lon) => setFormData(prev => ({ ...prev, location: address, lat, lon }))}
                                        // Custom styling for AddressAutocomplete input to match the design
                                        className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium"
                                        placeholder="Ex: Arena Soccer - Campo 2"
                                    />
                                    <div className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-20" title="Ver no mapa">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">map</span>
                                    </div>
                                </div>
                            </label>

                            {/* Small map preview */}
                            <div className="w-full h-32 rounded-lg overflow-hidden relative group cursor-pointer border border-slate-200 dark:border-slate-700">
                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/5 transition-colors z-10 flex items-center justify-center">
                                    <span className="bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm text-slate-700 dark:text-slate-200">Selecionar no mapa</span>
                                </div>
                                <img
                                    className="w-full h-full object-cover grayscale opacity-60"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZVMHR10KMRFCngofLGNzgd0-6R6vpXrf9_VI6ciE6TN9qLWnCtGhnlAJpoAP-Hd5QyR6IO-xwuIaDKFoUIQvipqVc9bTOETeERSaZ18I6jd68SOK8bqetsvtXm_EqPM4kVM550kO_X6XpU3WCMdoOL1U4XSjd1tWIu40nCecERqEs7MBiMFvkVeZvKhBN5FpW1WOmuxw4oGFUCqq-l_nLylVe5mUsqcZsrmVJDLC-yKkPasMeo25Mt5UyeJucrOixWMJB86EDPgY"
                                    alt="Map preview"
                                />
                            </div>
                        </div>

                        {/* Row 3: Spots & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2 group">
                                <span className="text-slate-700 dark:text-slate-300 font-semibold pl-1">Limite de Jogadores (Vagas)</span>
                                <div className="relative flex items-center">
                                    <input
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium appearance-none"
                                        type="number"
                                        min="10"
                                        max="50"
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
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]/50 focus:border-[#13ec5b] transition-all font-medium"
                                        type="text"
                                        placeholder="0,00"
                                    />
                                    <span className="material-symbols-outlined absolute left-4 text-[#13ec5b] pointer-events-none">attach_money</span>
                                    <div className="absolute right-4 text-slate-400 font-bold">R$</div>
                                </div>
                            </label>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse md:flex-row gap-4 md:items-center justify-end">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-4 rounded-full text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative px-8 py-4 bg-[#13ec5b] hover:bg-[#0fd652] active:scale-[0.98] rounded-full text-slate-900 font-bold shadow-lg shadow-[#13ec5b]/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="size-5 border-2 border-[#0d1b12] border-r-transparent rounded-full animate-spin"></span>
                                        <span>Criando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Criar Partida</span>
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Decorative footer text */}
                    <div className="text-center text-slate-400 text-sm">
                        <p>O convite será enviado automaticamente para o grupo do WhatsApp.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
