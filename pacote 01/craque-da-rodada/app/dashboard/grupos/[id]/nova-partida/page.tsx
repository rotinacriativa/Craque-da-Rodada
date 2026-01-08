"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/app/components/AddressAutocomplete";
import { supabase } from "@/src/lib/supabaseClient";

export default function CreateMatch({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const groupId = id;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        gender: "",
        location: "",
        lat: "",
        lon: "",
        capacity: "",
        price: "",
        isRecurring: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            let updates = { ...prev };

            if (type === 'checkbox') {
                const checked = (e.target as HTMLInputElement).checked;
                updates = { ...updates, [name]: checked };
            } else {
                updates = { ...updates, [name]: value };

                // Auto-detect day of week from date
                if (name === 'date' && value) {
                    const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                    // Force midday to avoid timezone shifts when creating Date object
                    const d = new Date(value + 'T12:00:00');
                    updates.dayOfWeek = days[d.getDay()];
                }
            }
            return updates;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Manual validation
        const requiredFields = [
            { key: 'name', label: 'Nome da Pelada' },
            { key: 'date', label: 'Data' },
            { key: 'dayOfWeek', label: 'Dia da Semana' },
            { key: 'startTime', label: 'Horário de Início' },
            { key: 'endTime', label: 'Horário de Fim' },
            { key: 'gender', label: 'Gênero' },
            { key: 'location', label: 'Local' },
            { key: 'capacity', label: 'Número de vagas' },
            { key: 'price', label: 'Valor por pessoa' }
        ];

        for (const field of requiredFields) {
            // @ts-ignore
            if (!formData[field.key]) {
                alert(`O campo "${field.label}" é obrigatório.`);
                return;
            }
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('matches')
                .insert([
                    {
                        group_id: groupId,
                        name: formData.name,
                        date: formData.date,
                        day_of_week: formData.dayOfWeek,
                        start_time: formData.startTime,
                        end_time: formData.endTime,
                        location: formData.location,
                        latitude: formData.lat ? parseFloat(formData.lat) : null,
                        longitude: formData.lon ? parseFloat(formData.lon) : null,
                        capacity: parseInt(formData.capacity),
                        price: parseFloat(formData.price.replace(',', '.')), // Handle potential comma
                        gender: formData.gender,
                        recurring: formData.isRecurring
                    }
                ]);

            if (error) throw error;

            alert(`Pelada "${formData.name}" criada com sucesso!`);
            router.push(`/dashboard/grupos/${groupId}`);

        } catch (error) {
            console.error('Erro ao criar pelada:', error);
            alert('Erro ao criar pelada. Verifique o console ou tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] relative">
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-10 relative">
                {/* Decorative Background */}
                <div className="absolute top-10 right-10 opacity-10 dark:opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[200px] text-[#13ec5b]">sports_soccer</span>
                </div>
                <div className="absolute bottom-10 left-10 opacity-10 dark:opacity-5 pointer-events-none">
                    <span className="material-symbols-outlined text-[150px] text-[#13ec5b]">stadium</span>
                </div>

                <div className="w-full max-w-[720px] flex flex-col mb-10 md:mb-0">
                    <Link
                        href={`/dashboard/grupos/${groupId}`}
                        className="inline-flex items-center gap-1 text-[#4c9a66] dark:text-[#8fcba5] hover:text-[#13ec5b] dark:hover:text-[#13ec5b] mb-6 transition-colors self-start text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Voltar para o Painel do Grupo
                    </Link>

                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-[#13ec5b]/10 dark:bg-[#13ec5b]/20 flex items-center justify-center text-[#13ec5b]">
                                <span className="material-symbols-outlined text-3xl">add_circle</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[#0d1b12] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                                    Criar nova Pelada
                                </h1>
                                <p className="text-[#4c9a66] dark:text-[#8fcba5] text-base font-normal">
                                    Defina os detalhes da próxima partida para a galera.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#183020] rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-[#e7f3eb] dark:border-[#1f3b29]">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Match Name */}
                            <label className="flex flex-col gap-2 w-full">
                                <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Nome da Pelada</span>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">edit</span>
                                    </div>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium"
                                        placeholder="Ex: Pelada de Terça - Arena Point"
                                        type="text"
                                    />
                                </div>
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Data</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">calendar_month</span>
                                        </div>
                                        <input
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium appearance-none"
                                            type="date"
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Dia da Semana</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">today</span>
                                        </div>
                                        <select
                                            name="dayOfWeek"
                                            value={formData.dayOfWeek}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-10 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Selecione o dia</option>
                                            <option value="segunda">Segunda-feira</option>
                                            <option value="terca">Terça-feira</option>
                                            <option value="quarta">Quarta-feira</option>
                                            <option value="quinta">Quinta-feira</option>
                                            <option value="sexta">Sexta-feira</option>
                                            <option value="sabado">Sábado</option>
                                            <option value="domingo">Domingo</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5]">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Horário de Início</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">schedule</span>
                                        </div>
                                        <input
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium appearance-none"
                                            type="time"
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Horário de Fim</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">timer_off</span>
                                        </div>
                                        <input
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium appearance-none"
                                            type="time"
                                        />
                                    </div>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Gênero</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">wc</span>
                                        </div>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-10 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Selecione</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="feminino">Feminino</option>
                                            <option value="misto">Misto</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5]">expand_more</span>
                                        </div>
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2 w-full md:col-span-2">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Local</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">location_on</span>
                                        </div>
                                        <AddressAutocomplete
                                            placeholder="Ex: Arena Soccer Society"
                                            value={formData.location}
                                            className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium"
                                            onChange={(val) => {
                                                setFormData(prev => ({ ...prev, location: val }));
                                            }}
                                            onSelect={(address, lat, lon) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    location: address,
                                                    lat: lat,
                                                    lon: lon
                                                }));
                                            }}
                                        />
                                    </div>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Número de vagas</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">group</span>
                                        </div>
                                        <input
                                            name="capacity"
                                            value={formData.capacity}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium"
                                            placeholder="Ex: 14"
                                            type="number"
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2 w-full">
                                    <span className="text-[#0d1b12] dark:text-white text-sm font-bold ml-4">Valor por pessoa</span>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#4c9a66] dark:text-[#8fcba5] group-focus-within:text-[#13ec5b] transition-colors">attach_money</span>
                                        </div>
                                        <input
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full h-14 pl-12 pr-6 rounded-full bg-[#f8fcf9] dark:bg-[#102216] border-2 border-[#cfe7d7] dark:border-[#2a4a35] text-[#0d1b12] dark:text-white placeholder:text-[#4c9a66]/50 dark:placeholder:text-[#8fcba5]/50 focus:border-[#13ec5b] focus:ring-0 focus:outline-none transition-all font-medium"
                                            placeholder="Ex: 25,00"
                                            type="text"
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* Recurring Match Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-[#e7f3eb] dark:border-[#1f3b29] hover:bg-[#f8fcf9] dark:hover:bg-[#102216]/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-[#0d1b12] dark:text-white font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#13ec5b]">update</span>
                                        Repetir toda semana
                                    </span>
                                    <span className="text-[#4c9a66] dark:text-[#8fcba5] text-sm">Cria automaticamente a partida para as próximas semanas.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        name="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                        type="checkbox"
                                    />
                                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13ec5b] shadow-inner"></div>
                                </label>
                            </div>

                            <button type="submit" disabled={isLoading} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-[#13ec5b] hover:bg-[#0fd650] text-[#0d1b12] disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold leading-normal tracking-wide transition-all transform active:scale-[0.98] shadow-lg shadow-[#13ec5b]/25 mt-4">
                                {isLoading ? (
                                    <>
                                        <span className="size-5 border-2 border-[#0d1b12] border-r-transparent rounded-full animate-spin mr-2"></span>
                                        <span>Criando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="truncate">Criar Pelada</span>
                                        <span className="material-symbols-outlined ml-2 text-xl font-bold">sports_soccer</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
