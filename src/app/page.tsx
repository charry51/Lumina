export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 drop-shadow-sm">
          Lumina
        </h1>
        <p className="text-xl text-zinc-400 max-w-md mx-auto">
          Plataforma de Digital Signage SaaS inteligente para la gestión de contenidos dinámica.
        </p>
        
        <div className="flex gap-4 items-center">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-white text-black gap-2 hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 font-bold shadow-xl"
            href="/dashboard"
          >
            Ir al Dashboard
          </a>
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
