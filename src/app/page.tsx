import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import ContactSection from '@/components/landing/ContactSection'
import { Monitor } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="dark min-h-screen bg-black flex flex-col selection:bg-[#D4AF37] selection:text-black">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-[100] border-b border-white/[0.05] bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#f1c40f] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Monitor className="w-4 h-4 text-black" />
             </div>
             <span className="text-xl font-heading font-medium tracking-tighter text-white">LUMINA</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">
             <Link href="#features" className="hover:text-[#D4AF37] transition-colors">Funciones</Link>
             <Link href="#impact" className="hover:text-[#D4AF37] transition-colors">Impacto</Link>
             <Link href="#pricing" className="hover:text-[#D4AF37] transition-colors">Programático</Link>
          </div>

          <div>
             <Link 
               href="/login" 
               className="px-5 py-2 rounded-full border border-white/10 text-white hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest font-bold"
             >
               Iniciar Sesión
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <HeroSection />
        <div id="features">
           <FeaturesSection />
        </div>

        <ContactSection />
        
        {/* CTA Final */}
        <section className="py-32 bg-black text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
               <h2 className="text-4xl md:text-6xl font-heading text-white tracking-tighter mb-8 leading-tight">
                  ¿Listo para dominar <br />
                  <span className="text-gradient-gold">el OOH Programático?</span>
               </h2>
               <Link href="/register" className="cyber-button-gold inline-block">
                  Crear Mi Cuenta Ahora
               </Link>
            </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black">
         <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] uppercase tracking-widest font-bold text-zinc-600">
            <div className="flex items-center gap-2">
               <span className="text-zinc-300">© 2026 LUMINA</span>
               <span>•</span>
               <span>Digital Signage Intelligence</span>
            </div>
            
            <div className="flex gap-8">
               <Link href="#" className="hover:text-white transition-colors">Términos</Link>
               <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
               <Link href="#" className="hover:text-white transition-colors">Contacto</Link>
            </div>
         </div>
      </footer>
    </div>
  )
}
