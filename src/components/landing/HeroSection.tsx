'use client'

import Link from 'next/link'
import { Monitor, MoveRight, Zap } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden px-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-[#2BC8FF]/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-[#7C3CFF]/5 rounded-full blur-[120px] pointer-events-none opacity-30" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#2BC8FF]/30 to-transparent" />
      
      <div className="container mx-auto max-w-6xl relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2BC8FF]/30 bg-[#2BC8FF]/5 text-[#2BC8FF] text-[10px] uppercase tracking-[0.2em] font-bold mb-8 shadow-[0_0_15px_rgba(43,200,255,0.1)]">
          <Zap className="w-3 h-3 fill-current" />
          Nueva Era: Programmatic OOH
        </div>
        
        <h1 className="text-5xl md:text-8xl font-heading font-light tracking-tighter text-white mb-6 leading-[0.9]">
          Domina la <br />
          <span className="text-gradient-ui font-medium">Atención</span> <span className="text-gradient-ui font-medium">Digital.</span>
        </h1>
        
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed mb-10">
          LumiAds transforma tus pantallas en activos inteligentes. 
          Publicidad programática basada en <span className="text-white font-medium">rendimiento real</span>, no en suposiciones.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="cyber-button-ui group w-full sm:w-auto">
            Empezar Ahora
            <MoveRight className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="px-8 py-3 rounded-full border border-[#7C3CFF]/30 text-[#7C3CFF] hover:bg-[#7C3CFF]/5 transition-all text-[10px] uppercase tracking-widest font-bold w-full sm:w-auto">
            Acceso Clientes
          </Link>
        </div>
      </div>

      {/* Floating UI Elements: Real App Statistics Display */}
      <div className="mt-20 relative w-full max-w-5xl mx-auto animate-float">
        <div className="landing-glass-ui p-1.5 rounded-[2.2rem] shadow-[0_0_80px_rgba(124,60,255,0.2)] relative z-20 overflow-hidden group">
          <div className="bg-black/95 rounded-[2rem] overflow-hidden border border-white/10 relative">
            <img 
              src="/dashboard_stats.png" 
              alt="LumiAds Real-Time Statistics Dashboard" 
              className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            />
            
            {/* Overlay Glow & Gradients for Depth */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
          </div>
        </div>
        
        {/* External Floating Chips - Nested inside animate-float */}
        <div className="absolute -top-10 -right-10 landing-glass-ui px-6 py-3 text-[12px] text-[#7C3CFF] font-black tracking-[0.3em] hidden lg:block border-[#7C3CFF]/40 shadow-[0_0_40px_rgba(124,60,255,0.2)] z-30">
          +2.4M IMPACTOS / MES
        </div>
        <div className="absolute -bottom-10 -left-10 landing-glass-ui px-6 py-3 text-[12px] text-[#2BC8FF] font-black tracking-[0.3em] hidden lg:block border-[#2BC8FF]/40 shadow-[0_0_40px_rgba(43,200,255,0.2)] z-30 transform -translate-y-4">
          REACH: 82% OPTIMIZED
        </div>
      </div>
    </section>
  )
}



