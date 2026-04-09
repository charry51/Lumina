'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { generatePairingCode, checkPairingStatus } from './actions'

// Generar un ID de dispositivo persistente (se guarda en localStorage)
function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'lumina_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export default function VincularPage() {
  const router = useRouter()
  const [code, setCode] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutos
  const [status, setStatus] = useState<'esperando' | 'vinculado' | 'expirado'>('esperando')
  const [pantallaId, setPantallaId] = useState<string | null>(null)

  const initPairing = useCallback(async () => {
    const deviceId = getDeviceId()
    const result = await generatePairingCode(deviceId)
    if ('code' in result) {
      setCode(result.code)
      setTimeLeft(600)
      setStatus('esperando')
    }
  }, [])

  // Inicializar al cargar
  useEffect(() => {
    initPairing()
  }, [initPairing])

  // Cuenta atrás
  useEffect(() => {
    if (status !== 'esperando') return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setStatus('expirado')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status])

  // Polling: comprobar si la TV ya fue vinculada (cada 3 seg)
  useEffect(() => {
    if (status !== 'esperando') return
    const poll = setInterval(async () => {
      const deviceId = getDeviceId()
      const result = await checkPairingStatus(deviceId)
      if (result.estado === 'vinculado' && result.pantallaId) {
        setStatus('vinculado')
        setPantallaId(result.pantallaId)
        clearInterval(poll)
        // Redirigir al player en 2 segundos
        setTimeout(() => {
          router.push(`/player/${result.pantallaId}`)
        }, 2500)
      } else if (result.estado === 'expirado') {
        setStatus('expirado')
        clearInterval(poll)
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [status, router])

  const mins = Math.floor(timeLeft / 60)
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,210,255,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent opacity-60" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.png" alt="Lumina" className="h-14 w-auto" />
          <span className="text-4xl font-black text-white tracking-[0.2em] uppercase"
            style={{ fontFamily: 'var(--font-heading)' }}>
            LUMINA
          </span>
        </div>

        <p className="text-zinc-400 text-xl uppercase tracking-[0.3em] text-sm">
          Vincula esta pantalla a tu cuenta
        </p>

        {/* Estado: ESPERANDO */}
        {status === 'esperando' && (
          <>
            <p className="text-zinc-500 text-base mb-2">
              Desde tu panel de control, ve a <strong className="text-white">Añadir Pantalla → Vincular TV</strong> y escribe:
            </p>

            {/* Código grande para ver desde lejos */}
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-[#00d2ff]/20 rounded-full" />
              <div className="relative bg-zinc-900/80 border-2 border-[#00d2ff]/40 rounded-2xl px-16 py-8 backdrop-blur-sm shadow-[0_0_60px_rgba(0,210,255,0.1)]">
                <span className="text-8xl font-black text-white tracking-[0.3em]"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  {code || '···'}
                </span>
              </div>
            </div>

            {/* Cuenta atrás */}
            <div className="flex items-center gap-2 text-zinc-600 text-sm font-mono">
              <div className="w-2 h-2 bg-[#00d2ff] rounded-full animate-pulse" />
              Este código caduca en{' '}
              <span className="text-[#00d2ff] font-bold">{mins}:{secs}</span>
            </div>

            <p className="text-zinc-700 text-xs uppercase tracking-widest mt-2">
              lumina.app · Esperando vinculación...
            </p>
          </>
        )}

        {/* Estado: VINCULADO */}
        {status === 'vinculado' && (
          <>
            <div className="text-8xl mb-4">✅</div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tight">
              ¡Vinculada!
            </h2>
            <p className="text-zinc-400 text-xl">
              Esta pantalla ya es parte de tu red LUMINA.
            </p>
            <div className="flex items-center gap-2 text-[#00d2ff] font-mono animate-pulse">
              <div className="w-2 h-2 bg-[#00d2ff] rounded-full animate-pulse" />
              Iniciando reproductor...
            </div>
          </>
        )}

        {/* Estado: EXPIRADO */}
        {status === 'expirado' && (
          <>
            <div className="text-8xl mb-4">⏱️</div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tight">
              Código expirado
            </h2>
            <p className="text-zinc-400 text-xl mb-6">
              El código ha caducado. Genera uno nuevo.
            </p>
            <button
              onClick={initPairing}
              className="bg-[#00d2ff] hover:bg-[#00bbdd] text-black font-black px-12 py-4 rounded-xl text-xl uppercase tracking-widest transition-all"
            >
              Generar nuevo código
            </button>
          </>
        )}
      </div>

      {/* Instrucciones inferiores */}
      {status === 'esperando' && (
        <div className="absolute bottom-8 flex items-center gap-8 text-zinc-700 text-[10px] uppercase tracking-widest font-mono">
          <span>1. Abre lumina.app en tu ordenador</span>
          <span className="text-zinc-800">|</span>
          <span>2. Ve a Pantallas → Vincular TV</span>
          <span className="text-zinc-800">|</span>
          <span>3. Introduce el código de arriba</span>
        </div>
      )}
    </div>
  )
}
