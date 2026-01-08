"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface IBGEUF {
    id: number;
    sigla: string;
    nome: string;
}

interface IBGECity {
    id: number;
    nome: string;
}

export default function OnboardingModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form State
    const [fullName, setFullName] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [maritalStatus, setMaritalStatus] = useState("Solteiro");
    const [hasChildren, setHasChildren] = useState(false);
    const [phone, setPhone] = useState("");

    // Location Data
    const [ufs, setUfs] = useState<IBGEUF[]>([]);
    const [cities, setCities] = useState<IBGECity[]>([]);

    const router = useRouter();

    // Fetch States (UFs)
    useEffect(() => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
            .then(res => res.json())
            .then(data => setUfs(data))
            .catch(err => console.error("Error fetching UFs:", err));
    }, []);

    // Fetch Cities when State changes
    useEffect(() => {
        if (state) {
            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
                .then(res => res.json())
                .then(data => setCities(data))
                .catch(err => console.error("Error fetching cities:", err));
        } else {
            setCities([]);
        }
    }, [state]);

    // Calculate Age
    useEffect(() => {
        if (birthDate) {
            const today = new Date();
            const birth = new Date(birthDate);
            let ageDetails = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                ageDetails--;
            }
            setAge(ageDetails);
        }
    }, [birthDate]);

    useEffect(() => {
        checkProfileStatus();
    }, []);

    const checkProfileStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        setUserId(user.id);

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Check if essential fields are missing
        const isIncomplete = !profile || !profile.phone || !profile.city || (!profile.birth_date && !profile.age);

        if (isIncomplete) {
            // Pre-fill what we have
            if (profile) {
                setFullName(profile.full_name || user.user_metadata?.full_name || "");
                setCity(profile.city || "");
                setState(profile.state || "");
                setBirthDate(profile.birth_date || "");
                if (!profile.birth_date && profile.age) setAge(profile.age);

                setMaritalStatus(profile.marital_status || "Solteiro");
                setHasChildren(profile.has_children || false);
                setPhone(profile.phone || "");
            } else {
                setFullName(user.user_metadata?.full_name || "");
            }
            setIsVisible(true);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);
        setErrorMessage(null);

        // Basic Validation
        if (!fullName || !city || !state || !birthDate || !phone) {
            setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
            setSaving(false);
            return;
        }

        const updates = {
            id: userId,
            full_name: fullName,
            city,
            state,
            birth_date: birthDate,
            age: age,
            marital_status: maritalStatus,
            has_children: hasChildren,
            phone,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            setErrorMessage("Erro ao salvar: " + error.message);
        } else {
            setIsVisible(false);
            router.refresh();
        }
        setSaving(false);
    };

    if (!isVisible) return null;

    if (loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#102216] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#13ec5b] p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#0d1b12] mb-2">sports_soccer</span>
                    <h2 className="text-2xl font-black text-[#0d1b12] uppercase tracking-tight">Bem-vindo ao Time!</h2>
                    <p className="text-[#0d1b12]/80 font-medium">Finalize seu cadastro para entrar em campo.</p>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSave} className="flex flex-col gap-6">
                        {errorMessage && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider">Nome Completo *</span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#1a2e22] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] outline-none transition-all font-medium text-[#0d1b12] dark:text-white" required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </label>

                            {/* State Selection */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider">Estado *</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#1a2e22] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                                    value={state}
                                    onChange={(e) => { setState(e.target.value); setCity(""); }}
                                    required
                                >
                                    <option value="">Selecione</option>
                                    {ufs.map(uf => (
                                        <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                    ))}
                                </select>
                            </label>

                            {/* City Selection (Dependent on State) */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider">Cidade *</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#1a2e22] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    disabled={!state}
                                    required
                                >
                                    <option value="">{state ? "Selecione" : "Selecione o Estado"}</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider">Celular (Zap) *</span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#1a2e22] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] outline-none transition-all font-medium text-[#0d1b12] dark:text-white" required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(21) 99999-9999" />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider flex justify-between">
                                    Nascimento *
                                    {age && <span className="text-[#13ec5b] font-normal">{age} anos</span>}
                                </span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#1a2e22] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] outline-none transition-all font-medium text-[#0d1b12] dark:text-white" required type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider">Estado Civil</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#1a2e22] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                                    value={maritalStatus}
                                    onChange={(e) => setMaritalStatus(e.target.value)}
                                >
                                    <option value="Solteiro">Solteiro(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Separado">Separado(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Viúvo">Viúvo(a)</option>
                                </select>
                            </label>

                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-[#4c9a66] uppercase tracking-wider">Tem filhos?</span>
                                <div className="flex gap-4 items-center h-12">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a2e22] transition-colors">
                                        <input type="radio" checked={hasChildren} onChange={() => setHasChildren(true)} className="accent-[#13ec5b] size-5" />
                                        <span className="text-[#0d1b12] dark:text-white font-medium">Sim</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a2e22] transition-colors">
                                        <input type="radio" checked={!hasChildren} onChange={() => { setHasChildren(false); }} className="accent-[#13ec5b] size-5" />
                                        <span className="text-[#0d1b12] dark:text-white font-medium">Não</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`mt-6 w-full h-14 bg-[#13ec5b] hover:bg-[#0eb545] text-[#0d1b12] font-black uppercase tracking-wide text-lg rounded-xl shadow-lg shadow-[#13ec5b]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {saving ? 'Salvando...' : 'Concluir Cadastro'}
                            {!saving && <span className="material-symbols-outlined font-bold">check</span>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
