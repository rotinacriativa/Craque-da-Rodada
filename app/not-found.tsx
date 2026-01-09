import Link from "next/link";
import { Lexend } from "next/font/google";

const lexend = Lexend({ subsets: ["latin"] });

export default function NotFound() {
    return (
        <div className={`${lexend.className} min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fcf9] dark:bg-[#102216] text-[#0d1b12] dark:text-white text-center`}>
            {/* Material Symbols */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

            {/* Background Decorative Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0" style={{ backgroundImage: "linear-gradient(to right, #13ec5b15 1px, transparent 1px), linear-gradient(to bottom, #13ec5b15 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}></div>

            <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Large 404 Text with Icon */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-9xl font-black text-[#13ec5b] drop-shadow-lg tracking-tighter">4</span>
                    <div className="relative size-32 bg-[#13ec5b] rounded-full flex items-center justify-center animate-bounce-slow shadow-2xl shadow-[#13ec5b]/30">
                        <span className="material-symbols-outlined text-8xl text-[#0d1b12]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                    </div>
                    <span className="text-9xl font-black text-[#13ec5b] drop-shadow-lg tracking-tighter">4</span>
                </div>

                {/* Message */}
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Bola fora!</h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-md mb-10 leading-relaxed">
                    Parece que você tentou um chute do meio de campo e a bola isolou. Essa página não existe.
                </p>

                {/* Action Button */}
                <Link
                    href="/"
                    className="group relative flex items-center justify-center gap-2 bg-[#13ec5b] hover:bg-[#0fb946] text-[#0d1b12] font-bold text-lg px-8 py-4 rounded-full transition-all shadow-lg shadow-[#13ec5b]/25 hover:shadow-[#13ec5b]/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="material-symbols-outlined text-2xl">home</span>
                    <span>Voltar para o Campo</span>
                </Link>
            </div>

            {/* Footer Note */}
            <div className="absolute bottom-8 text-xs text-gray-400 dark:text-gray-600">
                Erro 404 • Craque da Rodada
            </div>
        </div>
    );
}
