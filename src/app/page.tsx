import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-10 items-center text-center">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-zinc-800 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <img 
                src="/logo.png" 
                alt="Lumina" 
                className="relative h-24 sm:h-32 w-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
            />
        </div>
        <p className="text-xl text-zinc-400 max-w-md mx-auto">
          Plataforma de Digital Signage SaaS inteligente para la gestión de contenidos dinámica.
        </p>
        
        <div className="flex gap-4 items-center">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 font-bold shadow-xl"
            href="/dashboard"
          >
            Ir al Dashboard
          </Link>
          <a
            className="rounded-full border border-solid border-white transition-colors flex items-center justify-center hover:bg-[#222] text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8"
            href="https://github.com/charry51/Lumina"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </main>

      <footer className="mt-20 text-zinc-500 text-sm">
        © 2026 Lumina. Todos los derechos reservados.
      </footer>
    </div>
  );
}
