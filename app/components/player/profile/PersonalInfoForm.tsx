interface IBGEUF {
    id: number;
    sigla: string;
    nome: string;
}

interface IBGECity {
    id: number;
    nome: string;
}

interface PersonalInfoFormProps {
    fullName: string;
    state: string;
    city: string;
    phone: string;
    birthDate: string;
    age: number | null;
    maritalStatus: string;
    hasChildren: boolean;
    ufs: IBGEUF[];
    cities: IBGECity[];
    onFullNameChange: (value: string) => void;
    onStateChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onBirthDateChange: (value: string) => void;
    onMaritalStatusChange: (value: string) => void;
    onHasChildrenChange: (value: boolean) => void;
}

export function PersonalInfoForm({
    fullName,
    state,
    city,
    phone,
    birthDate,
    age,
    maritalStatus,
    hasChildren,
    ufs,
    cities,
    onFullNameChange,
    onStateChange,
    onCityChange,
    onPhoneChange,
    onBirthDateChange,
    onMaritalStatusChange,
    onHasChildrenChange
}: PersonalInfoFormProps) {
    return (
        <div className="bg-white dark:bg-[#1a2e22] rounded-xl p-6 md:p-8 border border-[#e7f3eb] dark:border-[#2a4032] shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#0d1b12] dark:text-white">
                <span className="material-symbols-outlined text-[#13ec5b]">badge</span>
                Informações Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Nome Completo</span>
                    <input
                        className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                        type="text"
                        value={fullName}
                        onChange={(e) => onFullNameChange(e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Estado</span>
                    <select
                        className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                        value={state}
                        onChange={(e) => { onStateChange(e.target.value); onCityChange(""); }}
                    >
                        <option value="">Selecione</option>
                        {ufs.map(uf => (
                            <option key={uf.id} value={uf.sigla}>{uf.nome}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Cidade</span>
                    <select
                        className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        value={city}
                        onChange={(e) => onCityChange(e.target.value)}
                        disabled={!state}
                    >
                        <option value="">{state ? "Selecione" : "Selecione o Estado"}</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.nome}>{city.nome}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Celular (Whatsapp)</span>
                    <input
                        className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                        type="tel"
                        value={phone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                        placeholder="(00) 00000-0000"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66] flex justify-between">
                        Data de Nascimento
                        {age && <span className="text-[#13ec5b] font-bold">{age} anos</span>}
                    </span>
                    <input
                        className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white"
                        type="date"
                        value={birthDate}
                        onChange={(e) => onBirthDateChange(e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Estado Civil</span>
                    <select
                        className="h-12 px-4 rounded-lg bg-[#f6f8f6] dark:bg-[#102216] border border-[#e7f3eb] dark:border-[#2a4032] focus:border-[#13ec5b] focus:ring-2 focus:ring-[#13ec5b]/50 outline-none transition-all font-medium text-[#0d1b12] dark:text-white cursor-pointer"
                        value={maritalStatus}
                        onChange={(e) => onMaritalStatusChange(e.target.value)}
                    >
                        <option value="Solteiro">Solteiro(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Separado">Separado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viúvo">Viúvo(a)</option>
                    </select>
                </label>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#4c9a66]">Tem filhos?</span>
                    <div className="flex gap-4 items-center h-12">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={hasChildren}
                                onChange={() => onHasChildrenChange(true)}
                                className="accent-[#13ec5b] size-5"
                            />
                            <span className="text-[#0d1b12] dark:text-white font-medium">Sim</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={!hasChildren}
                                onChange={() => onHasChildrenChange(false)}
                                className="accent-[#13ec5b] size-5"
                            />
                            <span className="text-[#0d1b12] dark:text-white font-medium">Não</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
