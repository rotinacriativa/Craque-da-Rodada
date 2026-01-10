interface AboutSectionProps {
    description?: string;
}

export function AboutSection({ description }: AboutSectionProps) {
    return (
        <div className="bg-white dark:bg-[#183020] rounded-xl p-5 border border-[#e7f3eb] dark:border-[#1f3b29]">
            <h3 className="font-bold text-lg text-[#0d1b12] dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#13ec5b]">info</span>
                Sobre a Pelada
            </h3>

            <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300">
                <p className="mb-3 text-sm leading-relaxed">
                    {description || "O administrador ainda não adicionou uma descrição para esta pelada."}
                </p>
            </div>
        </div>
    );
}
