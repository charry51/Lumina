import Link from 'next/link'
import Image from 'next/image'
import { Shield, Mail, Globe, Cpu } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#04060F] overflow-hidden w-full">
      {/* Top radial violet glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-[#7C3CFF]/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 xl:gap-8 gap-12">
          {/* Brand & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <Image
                src="/LogoPequeno.png"
                alt="LumiAds Icon"
                width={512}
                height={512}
                className="h-[32px] w-auto group-hover:scale-110 transition-transform"
              />
              <Image
                src="/LogoTexto.png"
                alt="LumiAds Brand"
                width={720}
                height={400}
                className="h-[40px] w-auto"
              />
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed font-sans">
              La plataforma premium de Digital Signage. Conectamos anunciantes de alto nivel con redes de pantallas en toda España mediante un ecosistema automatizado de Revenue Share e inteligencia digital.
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded border border-white/5">
                <Cpu className="w-3 h-3 text-[#2BC8FF]" /> v2.4.0
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 rounded border border-white/5">
                <Shield className="w-3 h-3 text-[#7C3CFF]" /> SSL Secured
              </span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 xl:col-span-2">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2BC8FF] mb-4">
                Anunciantes
              </h3>
              <ul className="space-y-3 font-sans text-xs">
                <li>
                  <Link href="/register?type=advertiser" className="text-zinc-400 hover:text-white transition-all">
                    Crear Campaña
                  </Link>
                </li>
                <li>
                  <Link href="/informacion/anunciante" className="text-zinc-400 hover:text-white transition-all">
                    Tarifas y Zonas
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-zinc-400 hover:text-white transition-all">
                    Audiencias e Impactos
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7C3CFF] mb-4">
                Propietarios
              </h3>
              <ul className="space-y-3 font-sans text-xs">
                <li>
                  <Link href="/register?type=host" className="text-zinc-400 hover:text-white transition-all">
                    Vincular Pantalla
                  </Link>
                </li>
                <li>
                  <Link href="/planes/seleccionar" className="text-zinc-400 hover:text-white transition-all">
                    Planes SaaS
                  </Link>
                </li>
                <li>
                  <Link href="/informacion/gestor-pantallas" className="text-zinc-400 hover:text-white transition-all">
                    Monetización
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C94BFF] mb-4">
                Compañía
              </h3>
              <ul className="space-y-3 font-sans text-xs">
                <li>
                  <Link href="/contacto" className="text-zinc-400 hover:text-white transition-all">
                    Soporte y Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="text-zinc-400 hover:text-white transition-all">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="text-zinc-400 hover:text-white transition-all">
                    Términos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-zinc-500 font-mono">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            <span>&copy; {new Date().getFullYear()} LumiAds. Todos los derechos reservados.</span>
            <span className="hidden md:inline text-zinc-800">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]" />
              SYSTEM STATUS: OPTIMAL
            </span>
          </div>
          
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Github">
              <Globe className="w-4 h-4" />
            </a>
            <a href="mailto:soporte@lumiads.app" className="hover:text-white transition-colors" title="Contacto">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
