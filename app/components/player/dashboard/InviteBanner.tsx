import ShareButton from "../../../components/ShareButton";

export function InviteBanner() {
    return (
        <div className="bg-[#0d1b12] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-[-20px] bottom-[-40px] opacity-20 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[180px] text-[#13ec5b]">
                    mark_email_unread
                </span>
            </div>

            <div className="relative z-10">
                <h4 className="text-white font-bold text-xl mb-2">
                    Convide seus amigos
                </h4>
                <p className="text-[#8baaa0] text-sm mb-6 max-w-[200px]">
                    Aumente a resenha! Traga seus amigos para organizar o jogo com você.
                </p>
                <ShareButton path="/" title="Craque da Rodada" text="Vem jogar com a gente no Craque da Rodada!" />
            </div>
        </div>
    );
}
