
import Image from "next/image";
import Link from "next/link";
import { Lexend, Noto_Sans } from "next/font/google";

const lexend = Lexend({ subsets: ["latin"] });
const notoSans = Noto_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function Home() {
  return (
    <div className={`${lexend.className} relative flex min-h-screen w-full flex-col group/design-root bg-[#f6f8f6] dark:bg-[#102216] text-[#0d1b12] dark:text-gray-100 overflow-x-hidden`}>
      {/* Material Symbols Font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f3eb] dark:border-b-white/10 bg-[#f6f8f6]/90 dark:bg-[#102216]/90 backdrop-blur-md px-6 py-4 md:px-10 lg:px-40">
        <div className="flex items-center gap-3 text-[#0d1b12] dark:text-white cursor-pointer select-none">
          <span className="material-symbols-outlined text-[#13ec5b] text-3xl">sports_soccer</span>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">PelaFacil</h2>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <a className="text-sm font-medium leading-normal hover:text-[#13ec5b] transition-colors" href="#como-funciona">Como funciona</a>
            <a className="text-sm font-medium leading-normal hover:text-[#13ec5b] transition-colors" href="#precos">Preços</a>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-transparent border border-[#e7f3eb] dark:border-white/20 hover:bg-[#e7f3eb] dark:hover:bg-white/10 text-[#0d1b12] dark:text-white text-sm font-bold transition-all"
            >
              <span className="truncate">Login</span>
            </Link>
            <Link
              href="/cadastro"
              className="flex items-center justify-center overflow-hidden rounded-full h-10 px-5 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#0d1b12] text-sm font-bold shadow-lg shadow-[#13ec5b]/20 transition-all"
            >
              <span className="truncate">Criar conta grátis</span>
            </Link>
          </div>
        </div>
        {/* Mobile Menu Icon (Placeholder for functionality) */}
        <div className="md:hidden">
          <span className="material-symbols-outlined cursor-pointer">menu</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero Section */}
        <div className="w-full max-w-7xl px-4 md:px-10 lg:px-40 py-12 md:py-20">
          <div className="@container">
            <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-center">
              {/* Hero Text */}
              <div className="flex flex-col gap-6 flex-1 lg:max-w-[500px]">
                <div className="flex flex-col gap-4 text-left">
                  <h1 className="text-[#0d1b12] dark:text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                    A sua pelada organizada em <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13ec5b] to-green-400">segundos</span>.
                  </h1>
                  <h2 className="text-[#0d1b12]/80 dark:text-white/80 text-lg font-normal leading-relaxed">
                    Chega de listas no WhatsApp. Gerencie pagamentos, times e presença em um só lugar com o PelaFacil.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/cadastro"
                    className="flex h-12 px-6 items-center justify-center rounded-full bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#0d1b12] text-base font-bold shadow-lg shadow-[#13ec5b]/25 transition-transform hover:-translate-y-0.5"
                  >
                    <span className="truncate">Criar conta grátis</span>
                  </Link>
                  <Link
                    href="/login"
                    className="flex h-12 px-6 items-center justify-center rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-[#0d1b12] dark:text-white text-base font-bold transition-colors"
                  >
                    <span className="truncate">Entrar</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#4c9a66] dark:text-white/40 mt-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>Sem cartão de crédito necessário</span>
                </div>
              </div>
              {/* Hero Image */}
              <div className="flex-1 w-full flex justify-center lg:justify-end">
                <div
                  className="w-full aspect-[4/3] rounded-2xl bg-cover bg-center shadow-2xl shadow-green-900/10 dark:shadow-black/50 overflow-hidden relative"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdtfIxBTHaR_0f1jOSkMVmluNRLQR8Lyqa4ib8yu25qH7zMI0iHJmzixgJRRurqzUI4de-HCCOcnHs3HWRh_4BKWDpRJF3c1nXPqlrI8z6P0RVW-iQveLy-uu0Ny4ydZ9QjMFDr8jqZR58bm96x_RhY3l_LWs5dhWfb13Ic9qmv3GuPRAolYWlAudl4ndyMcto1y182yD5RXigxhOcWaAIBX7uLdplFsz70_QRRHAu4o2T3HsSLElIfE0MKAix2_gd53eAdfu8Spk')" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  {/* Floating Card Element */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-[#1a3324]/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-[#13ec5b]/20 p-2 rounded-full text-[#13ec5b]">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#4c9a66] dark:text-green-300 uppercase tracking-wider">Pagamento Confirmado</p>
                      <p className="text-sm font-bold text-[#0d1b12] dark:text-white">João pagou R$ 20,00</p>
                    </div>
                    <span className="material-symbols-outlined text-[#13ec5b]">check_circle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Como funciona Section */}
        <section className="w-full bg-white dark:bg-white/5 py-16 md:py-24" id="como-funciona">
          <div className="max-w-[960px] mx-auto px-4 md:px-10 lg:px-40 flex flex-col items-center">
            <h2 className="text-[#0d1b12] dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] mb-12 text-center">Como funciona</h2>
            <div className="w-full max-w-lg">
              <div className="grid grid-cols-[56px_1fr] gap-x-4">
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="flex items-center justify-center size-14 rounded-full bg-[#e7f3eb] dark:bg-white/10 text-[#13ec5b]">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                  </div>
                  <div className="w-[2px] bg-[#e7f3eb] dark:bg-white/10 h-full min-h-[60px] grow rounded-full"></div>
                </div>
                <div className="flex flex-1 flex-col py-2 pb-10">
                  <p className="text-[#4c9a66] dark:text-[#13ec5b] font-bold text-sm uppercase tracking-wide mb-1">Passo 1</p>
                  <h3 className="text-[#0d1b12] dark:text-white text-xl font-bold leading-normal mb-2">Crie seu grupo</h3>
                  <p className="text-[#0d1b12]/70 dark:text-white/60 text-base">Defina o local, horário e quanto cada um vai pagar. Personalize as regras da sua pelada.</p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-[2px] bg-[#e7f3eb] dark:bg-white/10 h-4 rounded-full"></div>
                  <div className="flex items-center justify-center size-14 rounded-full bg-[#e7f3eb] dark:bg-white/10 text-[#13ec5b]">
                    <span className="material-symbols-outlined text-2xl">share</span>
                  </div>
                  <div className="w-[2px] bg-[#e7f3eb] dark:bg-white/10 h-full min-h-[60px] grow rounded-full"></div>
                </div>
                <div className="flex flex-1 flex-col py-2 pb-10">
                  <p className="text-[#4c9a66] dark:text-[#13ec5b] font-bold text-sm uppercase tracking-wide mb-1">Passo 2</p>
                  <h3 className="text-[#0d1b12] dark:text-white text-xl font-bold leading-normal mb-2">Envie o link para a galera</h3>
                  <p className="text-[#0d1b12]/70 dark:text-white/60 text-base">Compartilhe no WhatsApp. Os jogadores confirmam presença e pagam direto pelo app.</p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-[2px] bg-[#e7f3eb] dark:bg-white/10 h-4 rounded-full"></div>
                  <div className="flex items-center justify-center size-14 rounded-full bg-[#e7f3eb] dark:bg-white/10 text-[#13ec5b]">
                    <span className="material-symbols-outlined text-2xl">sports_soccer</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col py-2">
                  <p className="text-[#4c9a66] dark:text-[#13ec5b] font-bold text-sm uppercase tracking-wide mb-1">Passo 3</p>
                  <h3 className="text-[#0d1b12] dark:text-white text-xl font-bold leading-normal mb-2">Jogo feito</h3>
                  <p className="text-[#0d1b12]/70 dark:text-white/60 text-base">O PelaFacil sorteia os times equilibrados baseado nas notas dos jogadores. É só jogar!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-40">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-[#0d1b12] dark:text-white text-3xl font-bold leading-tight tracking-[-0.015em] text-center">Por que usar o PelaFacil</h2>
              <p className="text-[#0d1b12]/60 dark:text-white/60 text-center mt-3 max-w-xl">Ferramentas profissionais para o futebol amador. Tudo que você precisa para evitar dor de cabeça.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="flex flex-col gap-4 p-8 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 hover:border-[#13ec5b]/50 transition-colors">
                <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#13ec5b] mb-2">
                  <span className="material-symbols-outlined text-2xl">savings</span>
                </div>
                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Sem calote</h3>
                <p className="text-[#0d1b12]/70 dark:text-white/60 leading-relaxed">Controle quem pagou e quem está devendo. Envie lembretes automáticos de pagamento antes do jogo.</p>
              </div>
              {/* Card 2 */}
              <div className="flex flex-col gap-4 p-8 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 hover:border-[#13ec5b]/50 transition-colors">
                <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#13ec5b] mb-2">
                  <span className="material-symbols-outlined text-2xl">balance</span>
                </div>
                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Times equilibrados</h3>
                <p className="text-[#0d1b12]/70 dark:text-white/60 leading-relaxed">Chega de panelinha. Nosso algoritmo sorteia os times baseado no nível técnico de cada jogador.</p>
              </div>
              {/* Card 3 */}
              <div className="flex flex-col gap-4 p-8 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 hover:border-[#13ec5b]/50 transition-colors">
                <div className="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-[#13ec5b] mb-2">
                  <span className="material-symbols-outlined text-2xl">trophy</span>
                </div>
                <h3 className="text-xl font-bold text-[#0d1b12] dark:text-white">Ranking e Estatísticas</h3>
                <p className="text-[#0d1b12]/70 dark:text-white/60 leading-relaxed">Registre os gols e assistências. Acompanhe quem é o artilheiro da temporada no seu grupo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full px-4 md:px-10 lg:px-40 pb-20">
          <div className="w-full bg-[#0d1b12] dark:bg-white/5 rounded-3xl overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#13ec5b 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-8">
              <div className="flex flex-col gap-4 max-w-xl text-center md:text-left">
                <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight">Pronto para entrar em campo?</h2>
                <p className="text-gray-300 text-lg">Crie sua conta agora e organize sua primeira pelada em menos de 2 minutos.</p>
              </div>
              <div className="flex-shrink-0">
                <Link
                  href="/cadastro"
                  className="flex min-w-[200px] h-14 items-center justify-center rounded-full bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#0d1b12] text-lg font-bold shadow-[0_0_20px_rgba(19,236,91,0.4)] hover:shadow-[0_0_30px_rgba(19,236,91,0.6)] transition-all transform hover:scale-105"
                >
                  <span className="truncate">Começar Grátis</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e7f3eb] dark:border-white/10 bg-white dark:bg-[#102216] py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-40 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-2 text-[#0d1b12] dark:text-white">
              <span className="material-symbols-outlined text-[#13ec5b]">sports_soccer</span>
              <span className="text-lg font-bold">PelaFacil</span>
            </div>
            <p className="text-sm text-[#0d1b12]/60 dark:text-white/50 text-center md:text-left max-w-xs">
              A plataforma definitiva para organizar seu futebol semanal sem estresse.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#0d1b12] dark:text-white">Produto</span>
              <Link className="text-[#0d1b12]/70 dark:text-white/60 hover:text-[#13ec5b] transition-colors" href="#">Funcionalidades</Link>
              <Link className="text-[#0d1b12]/70 dark:text-white/60 hover:text-[#13ec5b] transition-colors" href="#">Preços</Link>
              <Link className="text-[#0d1b12]/70 dark:text-white/60 hover:text-[#13ec5b] transition-colors" href="/login">Login</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#0d1b12] dark:text-white">Legal</span>
              <Link className="text-[#0d1b12]/70 dark:text-white/60 hover:text-[#13ec5b] transition-colors" href="#">Termos de Uso</Link>
              <Link className="text-[#0d1b12]/70 dark:text-white/60 hover:text-[#13ec5b] transition-colors" href="#">Privacidade</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-40 mt-12 pt-8 border-t border-slate-100 dark:border-white/5 text-center md:text-left">
          <p className="text-xs text-[#0d1b12]/40 dark:text-white/30">© 2023 PelaFacil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
