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
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // El cliente se crea una sola vez fuera o con useMemo, pero aquí lo dejamos simple
  const supabase = createClient()

  // 2. Todos los Effects (Sin condiciones previas)
  
  // Hidratación
  useEffect(() => {
    setHasHydrated(true)
  }, [])

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

  // Rotación de imágenes
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isImage && playlist.length > 0 && hasHydrated) {
      timer = setTimeout(() => {
        // Avance manual
        setCurrentIndex((prev) => (prev + 1) % playlist.length)
      }, 10000)
    }
    return () => { if (timer) clearTimeout(timer) }
  }, [currentIndex, isImage, playlist.length, hasHydrated])

  // 3. Funciones de apoyo
  const handleNext = async () => {
    const currentItem = playlist[currentIndex]
    if (currentItem?.id) {
       await logPlayback(currentItem.id, screenId).catch(console.error)
    }
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }
  }

  // 4. Sincronización de índice si el actual no es válido
  useEffect(() => {
    if (activeIndex !== currentIndex && hasHydrated) {
       setCurrentIndex(activeIndex)
    }
  }, [activeIndex, currentIndex, hasHydrated])

  // 5. Renderizado final (Única rama condicional permitida)
  
  if (!hasHydrated) {
    return <div className="w-screen h-screen bg-black" />
  }

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

  if (isImage) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <img src={currentMedia.url_video} alt="Campaign" className="w-full h-full object-cover" />
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
