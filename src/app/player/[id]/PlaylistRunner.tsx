'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { logPlayback } from '../actions'
import { createClient } from '@/lib/supabase/client'

type CampaignItem = {
  id: string;
  url_video: string;
  hora_inicio: string;
  hora_fin: string;
}

// Cola de logs offline (persiste en localStorage mientras no hay conexión)
const OFFLINE_LOG_KEY = 'lumina_offline_logs'

function getOfflineLogs(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(OFFLINE_LOG_KEY) || '[]') } catch { return [] }
}

function addOfflineLog(campaignId: string, screenId: string) {
  const logs = getOfflineLogs()
  logs.push(JSON.stringify({ campaignId, screenId, ts: Date.now() }))
  localStorage.setItem(OFFLINE_LOG_KEY, JSON.stringify(logs))
}

function clearOfflineLogs() {
  localStorage.removeItem(OFFLINE_LOG_KEY)
}

export default function PlaylistRunner({ screenId, playlist }: { screenId: string, playlist: CampaignItem[] }) {
  // ——— Estados ———
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({})
  const [isOnline, setIsOnline] = useState(true)
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'caching' | 'ready'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  // ——— 1. Registrar Service Worker ———
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[Lumina] Service Worker registrado:', reg.scope)
        })
        .catch((err) => console.error('[Lumina] Error registrando SW:', err))
    }
  }, [])

  // ——— 2. Detectar estado de conexión ———
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      console.log('[Lumina] Conexión restaurada. Sincronizando logs offline...')
      
      // Sincronizar logs pendientes cuando vuelve la conexión
      const pendingLogs = getOfflineLogs()
      if (pendingLogs.length > 0) {
        for (const logStr of pendingLogs) {
          try {
            const { campaignId, screenId: sId } = JSON.parse(logStr)
            await logPlayback(campaignId, sId)
          } catch (e) {
            console.error('[Lumina] Error sincronizando log offline:', e)
          }
        }
        clearOfflineLogs()
        console.log(`[Lumina] ${pendingLogs.length} logs sincronizados.`)
      }

      // Intentar Background Sync si el SW lo soporta
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready
        try { await (reg as any).sync.register('sync-playback-logs') } catch {}
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.warn('[Lumina] Sin conexión. Activando modo offline.')
    }

    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ——— 3. Pre-cachear todos los vídeos de la playlist ———
  useEffect(() => {
    setHasHydrated(true)
    if (playlist.length === 0) return

    const preloadMedia = async () => {
      setCacheStatus('caching')
      const newCachedUrls: Record<string, string> = {}

      // Notificar al SW que cachee estas URLs
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_MEDIA',
          urls: playlist.map(p => p.url_video).filter(Boolean),
        })

        // Limpiar media antigua que ya no está en la playlist
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_OLD_MEDIA',
          keepUrls: playlist.map(p => p.url_video).filter(Boolean),
        })
      }

      // Obtener Blobs locales para reproducción instantánea
      const cache = await caches.open('lumina-media-v2')
      for (const item of playlist) {
        if (!item.url_video) continue
        try {
          let response = await cache.match(item.url_video)
          if (!response) {
            try {
              await cache.add(item.url_video)
              response = await cache.match(item.url_video)
            } catch {
              // Si falla la descarga (offline), usar URL original como fallback
              newCachedUrls[item.url_video] = item.url_video
              continue
            }
          }
          if (response) {
            const blob = await response.blob()
            newCachedUrls[item.url_video] = URL.createObjectURL(blob)
          }
        } catch {
          newCachedUrls[item.url_video] = item.url_video
        }
      }

      setCachedUrls(newCachedUrls)
      setCacheStatus('ready')
      console.log('[Lumina] Todos los medios cacheados y listos para reproducción offline.')
    }

    preloadMedia()
  }, [playlist])

  // ——— 4. Presencia en tiempo real ———
  useEffect(() => {
    if (!screenId) return
    const channel = supabase.channel('LuminaNetwork', {
      config: { presence: { key: screenId } }
    })
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString(), status: isOnline ? 'playing' : 'offline' })
      }
    })
    return () => { channel.unsubscribe() }
  }, [screenId, supabase, isOnline])

  // ——— 5. Autoplay ———
  useEffect(() => {
    if (videoRef.current && hasHydrated) {
      videoRef.current.play().catch(e => console.warn('Autoplay bloqueado:', e))
    }
  }, [currentIndex, playlist, hasHydrated])

  // ——— 6. Validación de franja horaria ———
  const isValidTime = (inicio: string, fin: string) => {
    if (!inicio || !fin) return true
    const now = new Date()
    const currentMins = now.getHours() * 60 + now.getMinutes()
    const [hI, mI] = inicio.split(':').map(Number)
    const [hF, mF] = fin.split(':').map(Number)
    return currentMins >= (hI * 60 + (mI || 0)) && currentMins <= (hF * 60 + (mF || 0))
  }

  // ——— 7. Encontrar ítem activo según horario ———
  let attempts = 0
  let activeIndex = currentIndex
  let currentMedia = playlist[activeIndex]
  while (playlist.length > 0 && currentMedia && !isValidTime(currentMedia.hora_inicio, currentMedia.hora_fin) && attempts < playlist.length) {
    activeIndex = (activeIndex + 1) % playlist.length
    currentMedia = playlist[activeIndex]
    attempts++
  }

  const isImage = currentMedia?.url_video ? /\.(jpg|jpeg|png|webp|gif)$/i.test(currentMedia.url_video) : false
  const activeUrl = currentMedia ? (cachedUrls[currentMedia.url_video] || currentMedia.url_video) : null

  // ——— 8. Rotación de imágenes ———
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isImage && playlist.length > 0 && hasHydrated) {
      timer = setTimeout(handleNext, 10000)
    }
    return () => { if (timer) clearTimeout(timer) }
  }, [currentIndex, isImage, playlist.length, hasHydrated])

  // ——— 9. Avanzar con log de reproducción (online o cola offline) ———
  const handleNext = useCallback(async () => {
    const currentItem = playlist[currentIndex]
    
    // Si solo hay un vídeo, el currentIndex no cambia, así que forzamos el reinicio manual
    if (playlist.length === 1 && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }

    if (currentItem?.id) {
      if (isOnline) {
        logPlayback(currentItem.id, screenId).catch(() => {
          // Si falla estando "online", guardar en cola
          addOfflineLog(currentItem.id, screenId)
        })
      } else {
        // Sin conexión: añadir a la cola para sincronizar después
        addOfflineLog(currentItem.id, screenId)
      }
    }
    
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }
  }, [playlist, currentIndex, screenId, isOnline])

  useEffect(() => {
    if (activeIndex !== currentIndex && hasHydrated) {
      setCurrentIndex(activeIndex)
    }
  }, [activeIndex, currentIndex, hasHydrated])

  // ——— RENDER ———
  if (!hasHydrated) {
    return <div className="w-screen h-screen bg-[#0a0a0f]" />
  }

  if (playlist.length === 0 || attempts >= playlist.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] text-white p-12 text-center">
        <div className="cyber-card p-12 max-w-2xl border-dashed border-2">
          <h1 className="text-6xl font-heading mb-6 text-gradient font-black">LUMINA</h1>
          <h2 className="text-2xl font-sans text-zinc-400 uppercase tracking-widest">Espacio Publicitario</h2>
          <p className="mt-8 text-muted-foreground font-mono text-sm uppercase">Sin contenido programado para este horario</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#0a0a0f] relative">
      {/* Indicador de estado offline */}
      {!isOnline && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/80 border border-yellow-500/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-400 text-[10px] font-mono uppercase tracking-widest">Modo Offline</span>
        </div>
      )}

      {/* Indicador de caché descargando */}
      {cacheStatus === 'caching' && isOnline && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/80 border border-primary/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-primary text-[10px] font-mono uppercase tracking-widest">Sincronizando...</span>
        </div>
      )}

      {/* Contenido principal */}
      {isImage ? (
        activeUrl && <img src={activeUrl} alt="Campaign Content" className="w-full h-full object-cover" />
      ) : (
        activeUrl && (
          <video
            ref={videoRef}
            key={activeUrl}
            src={activeUrl}
            autoPlay
            muted
            playsInline
            loop={playlist.length === 1}
            className="w-full h-full object-cover"
            onEnded={handleNext}
            onError={() => {
              console.error('[Lumina] Error reproduciendo:', activeUrl)
              handleNext()
            }}
          />
        )
      )}
    </div>
  )
}
