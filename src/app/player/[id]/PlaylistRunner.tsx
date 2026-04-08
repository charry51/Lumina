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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const supabase = createClient()

  // Prevent hydration mismatch
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  // 1. PRESENCE (MONITOR DE SALUD REALTIME)
  useEffect(() => {
    if (!screenId) return;

    // Abrimos el canal global 'LuminaNetwork'
    const channel = supabase.channel('LuminaNetwork', {
      config: { presence: { key: screenId } }
    })

    channel.on('presence', { event: 'sync' }, () => {
        // Podríamos leer el estado de todos aquí
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const presenceTrackStatus = await channel.track({
          online_at: new Date().toISOString(),
          status: 'playing'
        })
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [screenId])

  // Lógica de avance
  const handleNext = async () => {
    // Registramos que el vídeo actual terminó de reproducirse (Proof of Play)
    const currentItem = playlist[currentIndex]
    if (currentItem && currentItem.id) {
       await logPlayback(currentItem.id, screenId).catch(console.error)
    }

    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }
  }

  // Force play if needed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.warn("Autoplay blocked or delayed", e)
      })
    }
  }, [currentIndex, playlist])

  if (!hasHydrated) return null

  // FILTRO HORARIO (Scheduling en Tiempo Real)
  // Calculamos en el cliente si la campaña cumple el horario ESTRICTO
  const isValidTime = (inicio: string, fin: string) => {
    if (!inicio || !fin) return true; // Si no hay límites, siempre valido
    
    // Simplificación de comprobación horaria rápida (se asume timezone local)
    const now = new Date()
    const currentMins = now.getHours() * 60 + now.getMinutes()
    
    const [hI, mI] = inicio.split(':').map(Number)
    const startMins = hI * 60 + (mI || 0)
    
    const [hF, mF] = fin.split(':').map(Number)
    const endMins = hF * 60 + (mF || 0)

    if (startMins <= endMins) {
      return currentMins >= startMins && currentMins <= endMins
    } else {
      // Cruzando medianoche
      return currentMins >= startMins || currentMins <= endMins
    }
  }

  // Buscamos el siguiente válido
  let attempts = 0;
  let activeIndex = currentIndex;
  let currentMedia = playlist[activeIndex];

  while (playlist.length > 0 && currentMedia && !isValidTime(currentMedia.hora_inicio, currentMedia.hora_fin) && attempts < playlist.length) {
      activeIndex = (activeIndex + 1) % playlist.length;
      currentMedia = playlist[activeIndex];
      attempts++;
  }

  // Si después de buscar no hay NINGUNO válido por hora, pasamos a estado vacío
  if (playlist.length === 0 || attempts >= playlist.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-gradient-to-br from-zinc-900 to-black text-white p-12 text-center border-4 border-dashed border-zinc-800">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Lumina
        </h1>
        <h2 className="text-3xl font-light text-zinc-400">Espacio Disponible</h2>
        <p className="mt-8 text-zinc-600 font-mono">Esperando programación válida horaria...</p>
      </div>
    )
  }

  // Si el ciclo avanzó buscando la válida, sincronizamos el estado discretamente (sin re-render extra)
  if (activeIndex !== currentIndex && hasHydrated) {
      setTimeout(() => setCurrentIndex(activeIndex), 0)
      return null; // Esperamos al re-render
  }

  const isImage = currentMedia.url_video ? /\.(jpg|jpeg|png|webp|gif)$/i.test(currentMedia.url_video) : false

  // Image rotation logic
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isImage && playlist.length > 0) {
      timer = setTimeout(() => {
        handleNext()
      }, 10000) // 10 segundos por imagen
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [currentIndex, isImage, playlist.length])

  if (isImage) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <img 
          src={currentMedia.url_video} 
          alt="Campaign" 
          className="w-full h-full object-cover" 
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-black">
      <video
        ref={videoRef}
        key={currentMedia.url_video}
        src={currentMedia.url_video}
        autoPlay
        muted
        playsInline 
        className="w-full h-full object-cover"
        onEnded={handleNext}
        onError={() => {
          console.error("Error playing video:", currentMedia.url_video)
          handleNext()
        }}
      />
    </div>
  )
}
