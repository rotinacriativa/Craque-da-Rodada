"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/src/lib/supabaseClient";

interface IBGEUF {
    id: number;
    sigla: string;
    nome: string;
}

interface IBGECity {
    id: number;
    nome: string;
}

export default function UserProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [age, setAge] = useState<number | "">("");
    const [maritalStatus, setMaritalStatus] = useState("Solteiro");
    const [hasChildren, setHasChildren] = useState(false);
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");

    // Player Stats/Info
    const [position, setPosition] = useState("");
    const [dominantFoot, setDominantFoot] = useState("");
    const [jerseyNumber, setJerseyNumber] = useState("");
    const [skillLevel, setSkillLevel] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Location Data
    const [ufs, setUfs] = useState<IBGEUF[]>([]);
    const [cities, setCities] = useState<IBGECity[]>([]);

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

    // Calculate Age when Birth Date changes
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

    // Fetch user data on mount
    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);

            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            setUserId(user.id);
            setEmail(user.email || "");

            // 2. Get profile data
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const metaName = user.user_metadata?.full_name || "";

            if (data) {
                setFullName(data.full_name || metaName);
                setCity(data.city || "");
                setState(data.state || "");
                setBirthDate(data.birth_date || "");
                setAge(data.age || "");
                setMaritalStatus(data.marital_status || "Solteiro");
                setHasChildren(data.has_children || false);
                setPhone(data.phone || "");
                setBio(data.bio || "");
                setPosition(data.position || "");
                setDominantFoot(data.dominant_foot || "");
                setJerseyNumber(data.jersey_number || "");
                setSkillLevel(data.skill_level || "");
                setAvatarUrl(data.avatar_url || null);
            } else {
                setFullName(metaName);
            }

            setLoading(false);
        }

        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        setMessage(null);

        const updates = {
            id: userId,
            full_name: fullName,
            city,
            state,
            birth_date: birthDate,
            age: age ? Number(age) : null,
            marital_status: maritalStatus,
            has_children: hasChildren,
            phone,
            bio,
            position,
            dominant_foot: dominantFoot,
            jersey_number: jerseyNumber,
            skill_level: skillLevel,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            setMessage({ type: 'error', text: "Erro ao salvar: " + error.message });
        } else {
            setMessage({ type: 'success', text: "Salvo com sucesso!" });
            setTimeout(() => setMessage(null), 3000);
        }
        setSaving(false);
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !userId) return;

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setSaving(true);
        setMessage(null);

        try {
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({ id: userId, avatar_url: publicUrl });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: "Foto atualizada!" });
        } catch (error: any) {
            setMessage({ type: 'error', text: "Erro ao atualizar foto: " + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-[#13ec5b] animate-spin">progress_activity</span>
                    <p className="text-[#4c9a66]">Carregando seu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0d1b12] dark:text-white">Meu Perfil</h1>
                    <p className="text-[#4c9a66] mt-1">Gerencie sua identidade de craque e estatísticas.</p>
                </div>
                <div className="flex gap-3 items-center">
                    {message && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className="material-symbols-outlined text-lg">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                            {message.text}
                        </div>
                    )}
                    <button onClick={handleSave} disabled={saving} className={`px-6 py-2.5 rounded-full bg-[#13ec5b] hover:bg-[#0eb545] text-[#0d1b12] font-bold text-sm shadow-lg shadow-[#13ec5b]/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Avatar & Bio */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#13ec5b]/20 to-transparent"></div>
                        <div className="relative flex flex-col items-center">
                            <div className="relative mb-4 group-hover:scale-105 transition-transform">
                                <div className="size-32 rounded-full border-4 border-white dark:border-[#1a2e22] shadow-md bg-cover bg-center bg-gray-200" style={{ backgroundImage: `url('${avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}')` }}></div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-[#0d1b12] text-white rounded-full hover:bg-[#13ec5b] hover:text-[#0d1b12] transition-colors shadow-lg border-2 border-white dark:border-[#1a2e22] cursor-pointer" title="Alterar foto">
                                    <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-center text-[#0d1b12] dark:text-white">{fullName || "Nome do Jogador"}</h2>
                            <p className="text-[#4c9a66] text-sm font-medium mb-4">{email}</p>

                            {/* Simple Stats for Visual Appeal */}
                            <div className="w-full grid grid-cols-3 gap-2 border-t border-[#e7f3eb] dark:border-[#2a4032] pt-6 mt-2">
                                <div className="text-center"><p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">Jogos</p><p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p></div>
                                <div className="text-center border-l border-r border-[#e7f3eb] dark:border-[#2a4032]"><p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">Gols</p><p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p></div>
                                <div className="text-center"><p className="text-xs text-[#4c9a66] uppercase font-bold tracking-wider">MVPs</p><p className="text-xl font-black text-[#0d1b12] dark:text-white">0</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#13ec5b]">person</span>
                            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white">Sobre Mim</h3>
                        </div>
                        <label className="block">
                            <textarea className="w-full min-h-[120px] rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] p-3 text-sm focus:ring-2 focus:ring-[#13ec5b] focus:border-[#13ec5b] resize-none transition-all placeholder:text-[#4c9a66]/50 text-[#0d1b12] dark:text-white focus:outline-none" placeholder="Conte um pouco sobre seu estilo de jogo..." value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                        </label>
                    </div>
                </div>

                {/* Right Column: Extended Personal Info & Player Stats */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* 1. Informações Pessoais (Expanded) */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#0d1b12] dark:text-white">
                            <span className="material-symbols-outlined text-[#13ec5b]">badge</span>
                            Informações Pessoais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <label className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Nome Completo</span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            </label>

                            {/* State Selection */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Estado</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                                    value={state}
                                    onChange={(e) => { setState(e.target.value); setCity(""); }}
                                >
                                    <option value="">Selecione</option>
                                    {ufs.map(uf => (
                                        <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                                    ))}
                                </select>
                            </label>

                            {/* City Selection (Dependent on State) */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Cidade</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    disabled={!state}
                                >
                                    <option value="">{state ? "Selecione" : "Selecione o Estado"}</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.nome}>{city.nome}</option>
                                    ))}
                                </select>
                            </label>

                            {/* Phone & Date of Birth */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Celular (Whatsapp)</span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66] flex justify-between">
                                    Data de Nascimento
                                    {age && <span className="text-[#13ec5b] font-bold">{age} anos</span>}
                                </span>
                                <input className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            </label>

                            {/* Marital Status */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Estado Civil</span>
                                <select
                                    className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
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

                            {/* Children */}
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Tem filhos?</span>
                                <div className="flex gap-4 items-center h-12">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={hasChildren} onChange={() => setHasChildren(true)} className="accent-[#13ec5b] size-5" />
                                        <span className="text-[#0d1b12] dark:text-white font-medium">Sim</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={!hasChildren} onChange={() => { setHasChildren(false); }} className="accent-[#13ec5b] size-5" />
                                        <span className="text-[#0d1b12] dark:text-white font-medium">Não</span>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 2. Ficha do Jogador (Unchanged logic, just ensuring layout) */}
                    <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-[#0d1b12] dark:text-white">
                                <span className="material-symbols-outlined text-[#13ec5b]">sports_soccer</span>
                                Ficha do Jogador
                            </h3>
                            <span className="bg-[#13ec5b]/10 text-[#0eb545] dark:text-[#13ec5b] text-xs font-bold px-3 py-1 rounded-full uppercase">Editável</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Position */}
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-medium text-[#4c9a66]">Posição Preferida</span>
                                <div className="flex flex-wrap gap-2">
                                    {['Goleiro', 'Defesa', 'Meio', 'Ataque'].map(pos => (
                                        <button key={pos} onClick={() => setPosition(pos)} className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${position === pos ? 'bg-[#13ec5b] text-[#0d1b12] border-[#13ec5b] shadow-md font-bold' : 'border-[#e7f3eb] dark:border-[#2a4032] opacity-70 hover:opacity-100 hover:border-[#13ec5b] text-[#0d1b12] dark:text-white'}`}>{pos}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Foot */}
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-medium text-[#4c9a66]">Pé Dominante</span>
                                <div className="flex bg-[#f6f8f6] dark:bg-[#102216] p-1 rounded-lg border border-[#e7f3eb] dark:border-[#2a4032]">
                                    {['Esquerdo', 'Direito', 'Ambos'].map(foot => (
                                        <button key={foot} onClick={() => setDominantFoot(foot)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${dominantFoot === foot ? 'bg-[#13ec5b] text-[#0d1b12] shadow-sm font-bold' : 'text-[#4c9a66] hover:text-[#0d1b12] dark:hover:text-white'}`}>{foot}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Jersey */}
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-[#4c9a66]">Camisa Favorita</span>
                                <div className="relative">
                                    <input className="w-full h-12 pl-4 pr-12 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-black text-lg text-[#0d1b12] dark:text-white" type="number" value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#4c9a66]">checkroom</span>
                                </div>
                            </label>
                            {/* Skill */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-[#4c9a66]">Nível Técnico</span>
                                    <span className="text-xs font-bold text-[#13ec5b] bg-[#13ec5b]/10 px-2 py-0.5 rounded">{skillLevel || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032]">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setSkillLevel(star === 1 ? 'Iniciante' : star === 2 ? 'Amador' : star === 3 ? 'Intermediário' : star === 4 ? 'Avançado' : 'Craque')} className="text-[#13ec5b] hover:scale-110 transition-transform cursor-pointer">
                                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `'FILL' ${['Iniciante', 'Amador', 'Intermediário', 'Avançado', 'Craque'].indexOf(skillLevel) >= star - 1 ? 1 : 0}` }}>star</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
