'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'
import { SoporteNotificationBadge } from '@/components/SoporteNotificationBadge'
import { ConectarPantallaModal } from '@/app/host/ConectarPantallaModal'
import { 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Wallet, 
  Plus, 
  Monitor,
  LifeBuoy
} from 'lucide-react'

type DashboardHeaderProps = {
  userName: string
  role: 'host' | 'advertiser'
  saldoBilletera?: number
}

export function DashboardHeader({ userName, role, saldoBilletera = 0 }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHost = role === 'host'

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    await logout()
  }

  return (
    <header className="mb-8 border-b border-zinc-900 pb-8 relative z-50">
      <div className="flex justify-between items-center w-full gap-4">
        {/* LOGO & PROFILE GREETINGS */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <Image
              src="/LogoPequeno.png"
              alt="LumiAds Icon"
              width={512}
              height={512}
              className="h-[40px] sm:h-[52px] md:h-[64px] w-auto group-hover:scale-110 transition-transform"
            />
            <Image
              src="/LogoTexto.png"
              alt="LumiAds Brand"
              width={720}
              height={400}
              className="h-[48px] sm:h-[64px] md:h-[82px] w-auto hidden xs:block"
            />
          </Link>
          <div className="border-l border-white/10 pl-3 sm:pl-4 py-1 flex flex-col justify-center shrink-0">
            {isHost ? (
              <span className="bg-lumi-violet/10 text-lumi-violet text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded border border-lumi-violet/20 uppercase tracking-widest w-fit">
                DUEÑO DE PANTALLAS
              </span>
            ) : (
              <span className="bg-[#2BC8FF]/10 text-[#2BC8FF] text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded border border-[#2BC8FF]/20 uppercase tracking-widest w-fit">
                ADVERTISER
              </span>
            )}
            <p className="text-[8px] sm:text-[10px] text-zinc-500 font-mono uppercase tracking-[2px] sm:tracking-[4px] mt-1">
              Hola, {userName}
            </p>
          </div>
        </div>

        {/* DESKTOP NAVIGATION MENU (md and larger) */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 justify-end">
          {/* Wallet Balance (Advertiser only) */}
          {!isHost && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 mr-1 shrink-0">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">
                  Saldo Disponible
                </span>
                <span className="text-base font-black font-mono text-white leading-none">
                  {saldoBilletera.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-[#2BC8FF] ml-1">€</span>
                </span>
              </div>
              <Link href="/dashboard/billetera?returnTo=/advertiser">
                <Button size="sm" className="bg-[#2BC8FF] hover:bg-[#2BC8FF]/80 text-black flex gap-1.5 items-center text-[9px] uppercase font-black tracking-widest px-2.5 h-7 shadow-[0_0_10px_rgba(43,200,255,0.2)]">
                  <Wallet className="w-3 h-3" />
                  Recargar
                </Button>
              </Link>
            </div>
          )}

          {/* Estadísticas */}
          <Link href={isHost ? '/host/estadisticas' : '/advertiser/estadisticas'}>
            <Button variant="outline" className={`border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 flex gap-2 items-center text-[10px] uppercase font-bold tracking-widest px-3.5`}>
              <TrendingUp className={`w-4 h-4 ${isHost ? 'text-violet-500' : 'text-[#2BC8FF]'}`} />
              Estadísticas
            </Button>
          </Link>

          {/* Perfil */}
          <Link href="/dashboard/perfil">
            <Button variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 flex gap-2 items-center text-[10px] uppercase font-bold tracking-widest px-3.5">
              <User className="w-3.5 h-3.5" />
              Perfil
            </Button>
          </Link>

          {/* Primary Action Button (Modal for Host, Link for Advertiser) */}
          {isHost ? (
            <ConectarPantallaModal
              trigger={
                <Button className="bg-violet-600 hover:bg-violet-500 text-white flex gap-2 items-center text-[10px] uppercase font-black tracking-widest px-5 shadow-[0_0_15px_rgba(124,60,255,0.4)]">
                  <Monitor className="w-4 h-4" />
                  Vincular nueva pantalla
                </Button>
              }
            />
          ) : (
            <Link href="/dashboard/nueva">
              <Button className="bg-[#2BC8FF] hover:bg-[#2BC8FF]/80 text-black flex gap-2 items-center text-[10px] uppercase font-black tracking-widest px-5 shadow-[0_0_15px_rgba(43,200,255,0.4)]">
                <Plus className="w-4 h-4" />
                Crear campaña
              </Button>
            </Link>
          )}

          {/* Soporte */}
          <SoporteNotificationBadge label="Soporte" />

          {/* Logout */}
          <form onSubmit={handleLogout}>
            <Button variant="outline" type="submit" className="border-red-900/50 bg-zinc-950 text-red-500 hover:text-red-400 hover:bg-red-950/20 text-[10px] uppercase font-bold tracking-widest px-3.5">
              Cerrar sesión
            </Button>
          </form>
        </div>

        {/* MOBILE ACTIONS + TRIGGER (lg hidden) */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Compact Wallet (Advertiser mobile only) */}
          {!isHost && (
            <div className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 flex flex-col items-end shrink-0 select-none">
              <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-bold leading-none">Saldo</span>
              <span className="text-xs font-black font-mono text-white leading-tight mt-0.5">
                {saldoBilletera.toFixed(1)}€
              </span>
            </div>
          )}

          {/* Primary Action Icon Button on Mobile to save space */}
          {isHost ? (
            <ConectarPantallaModal
              trigger={
                <Button className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 h-10 w-10 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(124,60,255,0.4)]" aria-label="Vincular nueva pantalla">
                  <Monitor className="w-4 h-4" />
                </Button>
              }
            />
          ) : (
            <Link href="/dashboard/nueva">
              <Button className="bg-[#2BC8FF] hover:bg-[#2BC8FF]/80 text-black p-2.5 h-10 w-10 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(43,200,255,0.4)]" aria-label="Crear campaña">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          )}

          {/* Hamburger Menu Trigger */}
          <Button
            variant="outline"
            className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white p-2.5 h-10 w-10 flex items-center justify-center rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN PANEL */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[calc(100%-8px)] left-0 w-full bg-zinc-950/95 border border-zinc-800 rounded-xl mt-3 p-5 flex flex-col gap-4 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-250">
          {/* Balance card (Mobile Menu Advertiser only) */}
          {!isHost && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">
                  Saldo Disponible
                </span>
                <span className="text-lg font-black font-mono text-white mt-1">
                  {saldoBilletera.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </span>
              </div>
              <Link href="/dashboard/billetera?returnTo=/advertiser" className="shrink-0" onClick={() => setMobileMenuOpen(false)}>
                <Button className="bg-[#2BC8FF] hover:bg-[#2BC8FF]/80 text-black flex gap-1.5 items-center text-[10px] uppercase font-black tracking-widest px-4 py-2 shadow-lg shadow-[#2BC8FF]/10 font-bold h-9">
                  <Wallet className="w-3.5 h-3.5" />
                  Recargar
                </Button>
              </Link>
            </div>
          )}

          {/* Menu Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href={isHost ? '/host/estadisticas' : '/advertiser/estadisticas'} 
              className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700 rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <TrendingUp className={`w-4 h-4 shrink-0 ${isHost ? 'text-violet-500' : 'text-[#2BC8FF]'}`} />
              <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-300">Estadísticas</span>
            </Link>

            <Link 
              href="/dashboard/perfil" 
              className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700 rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4 shrink-0 text-zinc-400" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-300">Perfil</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-zinc-900">
            {/* Soporte */}
            <div onClick={() => setMobileMenuOpen(false)}>
              <SoporteNotificationBadge 
                label="Soporte Técnico" 
                buttonClassName="w-full border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:bg-zinc-900 flex gap-2.5 items-center justify-center text-[10px] uppercase font-bold tracking-widest py-3 rounded-xl h-11"
              />
            </div>

            {/* Logout */}
            <form onSubmit={handleLogout} className="w-full">
              <Button 
                variant="outline" 
                type="submit" 
                className="w-full border-red-950/40 bg-red-950/5 hover:bg-red-950/20 text-red-500 hover:text-red-400 flex gap-2 items-center justify-center text-[10px] uppercase font-bold tracking-widest py-3 rounded-xl h-11 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
