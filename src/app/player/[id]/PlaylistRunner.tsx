'use client'

import { useState, useRef, useEffect } from 'react'
import { logPlayback } from '../actions'
import { createClient } from '@/lib/supabase/client'

type CampaignItem = {
  id: string;
  url_video: string;
  hora_inicio: string;
  hora_fin: string;
}

export default function PlaylistRunner({ screenId, playlist }: { screenId: string, playlist: CampaignItem[] }) {
  // 1. Estados y Refs
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({})
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  // 2. Todos los Effects
  
  // Hidratación y Cache Init
  useEffect(() => {
    setHasHydrated(true)
    
    // Pre-cargar todos los contenidos en caché
    const preloadMedia = async () => {
      const cache = await caches.open('lumina-media-v1');
      const newCachedUrls: Record<string, string> = {};

      for (const item of playlist) {
        if (!item.url_video) continue;
        try {
          // Intentar obtener de caché o descargar
          let response = await cache.match(item.url_video);
          if (!response) {
            console.log(`[Lumina Cache] Descargando: ${item.url_video}`);
            await cache.add(item.url_video);
            response = await cache.match(item.url_video);
          }
          
          if (response) {
            const blob = await response.blob();
            newCachedUrls[item.url_video] = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.error(`Error caching ${item.url_video}:`, error);
          // Fallback al URL original si falla la caché
          newCachedUrls[item.url_video] = item.url_video;
        }
      }
      setCachedUrls(newCachedUrls);
    };

    if (playlist.length > 0) preloadMedia();
  }, [playlist])

  // Presencia
  useEffect(() => {
    if (!screenId) return;
    const channel = supabase.channel('LuminaNetwork', {
      config: { presence: { key: screenId } }
    })
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString(), status: 'playing' })
      }
    })
    return () => { channel.unsubscribe() }
  }, [screenId, supabase])

  // Autoplay
  useEffect(() => {
    if (videoRef.current && hasHydrated) {
      videoRef.current.play().catch(e => console.warn("Autoplay blocked", e))
    }
  }, [currentIndex, playlist, hasHydrated])

  // Lógica de validación temporal
  const isValidTime = (inicio: string, fin: string) => {
    if (!inicio || !fin) return true;
    const now = new Date()
    const currentMins = now.getHours() * 60 + now.getMinutes()
    const [hI, mI] = inicio.split(':').map(Number)
    const startMins = hI * 60 + (mI || 0)
    const [hF, mF] = fin.split(':').map(Number)
    const endMins = hF * 60 + (mF || 0)
    return currentMins >= startMins && currentMins <= endMins
  }

  // Encontrar media activo
  let attempts = 0;
  let activeIndex = currentIndex;
  let currentMedia = playlist[activeIndex];

  while (playlist.length > 0 && currentMedia && !isValidTime(currentMedia.hora_inicio, currentMedia.hora_fin) && attempts < playlist.length) {
      activeIndex = (activeIndex + 1) % playlist.length;
      currentMedia = playlist[activeIndex];
      attempts++;
  }

  const isImage = currentMedia?.url_video ? /\.(jpg|jpeg|png|webp|gif)$/i.test(currentMedia.url_video) : false
  const activeUrl = currentMedia ? (cachedUrls[currentMedia.url_video] || currentMedia.url_video) : null;

  // Rotación de imágenes
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isImage && playlist.length > 0 && hasHydrated) {
      timer = setTimeout(() => {
        handleNext()
      }, 10000)
    }
    return () => { if (timer) clearTimeout(timer) }
  }, [currentIndex, isImage, playlist.length, hasHydrated])

  // 3. Funciones de apoyo
  const handleNext = async () => {
    const currentItem = playlist[currentIndex]
    if (currentItem?.id) {
       // Proof of Play: Log post-reproducción
       logPlayback(currentItem.id, screenId).catch(console.error)
    }
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }
  }

  useEffect(() => {
    if (activeIndex !== currentIndex && hasHydrated) {
       setCurrentIndex(activeIndex)
    }
  }, [activeIndex, currentIndex, hasHydrated])

  // 5. Renderizado final
  
  if (!hasHydrated) {
    return <div className="w-screen h-screen bg-[#0a0a0f]" />
  }

  if (playlist.length === 0 || attempts >= playlist.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0f] text-white p-12 text-center">
        <div className="cyber-card p-12 max-w-2xl border-dashed border-2">
            <h1 className="text-6xl font-heading mb-6 text-primary">
              Lumina
            </h1>
            <h2 className="text-2xl font-sans text-zinc-400 uppercase tracking-widest">Espacio Publicitario</h2>
            <p className="mt-8 text-muted-foreground font-mono text-sm uppercase">Sin contenido programado para este horario</p>
        </div>
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
        {activeUrl && <img src={activeUrl} alt="Campaign Content" className="w-full h-full object-cover" />}
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#0a0a0f]">
      {activeUrl && (
        <video
          ref={videoRef}
          key={activeUrl}
          src={activeUrl}
          autoPlay
          muted
          playsInline 
          className="w-full h-full object-cover"
          onEnded={handleNext}
          onError={() => {
            console.error("Error playing video:", activeUrl)
            handleNext()
          }}
        />
      )}
    </div>
  )
}
