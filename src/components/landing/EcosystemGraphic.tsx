'use client';

import React, { useState } from 'react'

export default function EcosystemGraphic() {
  const [activeTab, setActiveTab] = useState<'flow' | 'stats' | 'map'>('flow')

  return (
    <div className="my-12 relative w-full rounded-3xl border border-white/10 bg-[#070913]/90 p-4 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden text-left">
      {/* Background radial glow */}
      <div className="absolute -left-20 -top-20 w-[400px] h-[400px] bg-[#2BC8FF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] bg-[#7C3CFF]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Control Panel Mockup Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black">LumiAds Engine v2.4</span>
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-light text-white mt-1">
            Centro de Conexión en <span className="text-gradient-ui font-medium">Tiempo Real</span>
          </h2>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-white/[0.03] border border-white/10 rounded-full p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'flow'
                ? 'bg-gradient-to-r from-[#2BC8FF] to-[#7C3CFF] text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Flujo de Conexión
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-[#2BC8FF] to-[#7C3CFF] text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Rendimiento y Métricas
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-[#2BC8FF] to-[#7C3CFF] text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Distribución Mapa
          </button>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="bg-[#0A0E1A]/60 rounded-2xl border border-white/5 p-4 md:p-6 min-h-[360px] flex flex-col justify-between">
        
        {/* TAB 1: FLOW OF CONNECTION */}
        {activeTab === 'flow' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
            {/* Step 1: Advertiser */}
            <div className="lg:col-span-4 bg-[#11162D]/40 rounded-xl border border-white/5 p-5 relative">
              <span className="absolute -top-3 left-4 bg-[#2BC8FF] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                1. Anunciante
              </span>
              <h3 className="text-sm font-bold text-white mb-2 mt-1">Configuración y Carga</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                El anunciante sube su spot o imagen publicitaria, asigna presupuesto y define las horas y zonas donde desea emitir.
              </p>
              
              {/* Mini Upload Mockup */}
              <div className="border border-dashed border-[#2BC8FF]/30 bg-black/40 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                <svg className="w-8 h-8 text-[#2BC8FF] mb-1.5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-[9px] font-mono text-zinc-300">creativa_verano.mp4 (45 MB)</span>
                <span className="text-[8px] text-zinc-500 mt-0.5">Segmentación: Calles comerciales</span>
              </div>
            </div>

            {/* Step 2: Hub */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-4">
              <div className="relative w-20 h-20 flex items-center justify-center mb-3">
                <div className="absolute w-full h-full rounded-full border-2 border-dashed border-[#7C3CFF]/40 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-[#7C3CFF] to-[#2BC8FF] p-[1px] shadow-[0_0_25px_rgba(43,200,255,0.25)]">
                  <div className="w-full h-full rounded-full bg-[#080B1A] flex items-center justify-center text-white text-xs font-bold">
                    HUB
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Emparejamiento Inteligente</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs">
                LumiAds procesa la campaña en la nube y la asocia automáticamente con las pantallas disponibles que mejor encajan con la segmentación elegida.
              </p>
            </div>

            {/* Step 3: Screen Host */}
            <div className="lg:col-span-4 bg-[#11162D]/40 rounded-xl border border-white/5 p-5 relative">
              <span className="absolute -top-3 left-4 bg-[#7C3CFF] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                2. Soportes (Hosts)
              </span>
              <h3 className="text-sm font-bold text-white mb-2 mt-1">Reproducción y Monetización</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                El reproductor local recibe el anuncio de forma segura y lo proyecta. Cada reproducción se valida y se traduce en ingresos directos.
              </p>
              
              {/* Mini Player Mockup */}
              <div className="bg-black/55 rounded-lg border border-[#7C3CFF]/30 p-3 flex items-center gap-3">
                <div className="w-12 h-8 bg-[#0F1326] rounded border border-white/5 flex items-center justify-center shrink-0 overflow-hidden relative">
                  <div className="w-full h-1/2 bg-[#2BC8FF]/10 absolute top-0" />
                  <svg className="w-4 h-4 text-[#7C3CFF] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-white truncate">Pantalla Escaparate #4</p>
                  <p className="text-[8px] font-mono text-zinc-500 mt-0.5">Ingresos: +12.45 € hoy</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED GRAPHICS & STATISTICS */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#11162D]/30 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Impactos Totales del Mes</p>
                <p className="text-2xl font-semibold text-[#2BC8FF] tracking-tight mt-1">1,842,940</p>
                <span className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5 block">↑ 18.2% vs mes anterior</span>
              </div>
              <div className="bg-[#11162D]/30 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Ingresos Distribuidos a Locales</p>
                <p className="text-2xl font-semibold text-[#7C3CFF] tracking-tight mt-1">14,850.50 €</p>
                <span className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5 block">↑ 12.4% vs mes anterior</span>
              </div>
              <div className="bg-[#11162D]/30 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Costo Promedio por Impacto (CPM)</p>
                <p className="text-2xl font-semibold text-white tracking-tight mt-1">1.25 €</p>
                <span className="text-[9px] text-zinc-500 font-mono font-bold mt-0.5 block">Costo optimizado por algoritmo</span>
              </div>
            </div>

            {/* Large SVG Double Line Chart */}
            <div className="bg-black/40 rounded-xl border border-white/5 p-4 relative">
              <div className="absolute top-2 right-4 flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2BC8FF]" />
                  <span className="text-zinc-300">Anunciantes (Impactos)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3CFF]" />
                  <span className="text-zinc-300">Gestores (Ingresos)</span>
                </div>
              </div>

              <div className="w-full h-44 mt-6">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2BC8FF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2BC8FF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3CFF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7C3CFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  {/* Line 1 (Anunciantes) Area & Path */}
                  <path
                    d="M0,140 C50,135 90,95 130,105 C170,115 220,60 270,70 C320,80 370,30 420,40 C460,50 480,25 500,20 L500,150 L0,150 Z"
                    fill="url(#cyanArea)"
                  />
                  <path
                    d="M0,140 C50,135 90,95 130,105 C170,115 220,60 270,70 C320,80 370,30 420,40 C460,50 480,25 500,20"
                    fill="none"
                    stroke="#2BC8FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Line 2 (Gestores) Area & Path */}
                  <path
                    d="M0,145 C60,142 100,120 150,125 C200,130 250,90 300,95 C350,100 400,60 450,50 C480,45 490,42 500,35 L500,150 L0,150 Z"
                    fill="url(#purpleArea)"
                  />
                  <path
                    d="M0,145 C60,142 100,120 150,125 C200,130 250,90 300,95 C350,100 400,60 450,50 C480,45 490,42 500,35"
                    fill="none"
                    stroke="#7C3CFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />

                  {/* Chart Nodes */}
                  <circle cx="270" cy="70" r="4" fill="#2BC8FF" />
                  <circle cx="270" cy="70" r="8" fill="#2BC8FF" fillOpacity="0.2" className="animate-ping" style={{ transformOrigin: '270px 70px' }} />

                  <circle cx="450" cy="50" r="4" fill="#7C3CFF" />
                </svg>
              </div>

              {/* Chart X-Axis Labels */}
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-2 px-1">
                <span>Ene</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>May</span>
                <span>Jun (Hoy)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISTRIBUTION MAP MOCKUP */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Metrics & List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Cobertura Territorial</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Nuestra red de pantallas se extiende por los núcleos de mayor tráfico de las ciudades principales.
              </p>
              
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                  <span className="text-zinc-300 font-medium">Madrid (Centro & Salamanca)</span>
                  <span className="font-mono text-[#2BC8FF] font-bold">540 pantallas</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                  <span className="text-zinc-300 font-medium">Barcelona (Eixample & Diagonal)</span>
                  <span className="font-mono text-[#2BC8FF] font-bold">410 pantallas</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                  <span className="text-zinc-300 font-medium">Valencia & Sevilla</span>
                  <span className="font-mono text-[#2BC8FF] font-bold">290 pantallas</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Dotted Map Graphic */}
            <div className="lg:col-span-7 bg-[#050813] border border-white/5 rounded-xl p-4 h-[240px] flex items-center justify-center relative overflow-hidden">
              
              {/* Glowing abstract Map grid representation */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-transparent to-transparent" />
              
              {/* Abstract SVG Map representation */}
              <svg className="w-full h-full max-w-sm text-zinc-800" viewBox="0 0 200 120" fill="currentColor">
                {/* Spain outline representation */}
                <path d="M40,20 C60,18 90,12 120,15 C140,18 160,25 170,35 C175,40 180,60 165,80 C155,90 140,110 110,105 C90,100 70,105 60,95 C45,85 30,80 25,65 C20,50 25,30 40,20 Z" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                
                {/* Pulsing screen hubs */}
                {/* Madrid Hub */}
                <circle cx="100" cy="55" r="4" fill="#2BC8FF" />
                <circle cx="100" cy="55" r="10" fill="#2BC8FF" fillOpacity="0.2" className="animate-ping" style={{ transformOrigin: '100px 55px' }} />
                
                {/* Barcelona Hub */}
                <circle cx="150" cy="40" r="3.5" fill="#7C3CFF" />
                <circle cx="150" cy="40" r="8" fill="#7C3CFF" fillOpacity="0.2" className="animate-ping" style={{ transformOrigin: '150px 40px', animationDelay: '1s' }} />

                {/* Valencia Hub */}
                <circle cx="135" cy="65" r="3.5" fill="#2BC8FF" />
                
                {/* Sevilla Hub */}
                <circle cx="65" cy="85" r="3.5" fill="#7C3CFF" />
                
                {/* Connection lines from center hub */}
                <line x1="100" y1="55" x2="150" y2="40" stroke="rgba(43,200,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="100" y1="55" x2="135" y2="65" stroke="rgba(124,60,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="100" y1="55" x2="65" y2="85" stroke="rgba(43,200,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
              </svg>

              {/* Dotted HUD Overlay */}
              <div className="absolute bottom-3 left-4 flex gap-3 text-[9px] font-mono text-zinc-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2BC8FF]" /> Anuncios Activos</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3CFF]" /> Pantallas Registradas</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Footer statistics inside the mock */}
      <div className="mt-6 flex flex-wrap gap-6 text-[10px] font-mono text-zinc-500 justify-between items-center border-t border-white/5 pt-4">
        <div>LumiAds Network: <span className="text-zinc-300 font-bold">98.9% Uptime</span></div>
        <div className="flex gap-4">
          <span>Matchmaking Latency: <span className="text-emerald-400 font-bold">120ms</span></span>
          <span>Validated Impressions: <span className="text-zinc-300 font-bold">100% On-Chain</span></span>
        </div>
      </div>
    </div>
  )
}
