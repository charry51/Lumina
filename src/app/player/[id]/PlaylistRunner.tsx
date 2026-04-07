'use client'

import { useState, useRef, useEffect } from 'react'

export default function PlaylistRunner({ playlist }: { playlist: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasHydrated, setHasHydrated] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  // Handle when video finishes playing
  const handleNext = () => {
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length)
    }
  }

  // Force play if needed (some browsers require user interaction, but muted usually allows autoplay)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.warn("Autoplay blocked or delayed", e)
      })
    }
  }, [currentIndex, playlist])

  if (!hasHydrated) return null

  if (playlist.length === 0) {
    // ESTADO VACÍO: Imagen o Video por defecto
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-gradient-to-br from-zinc-900 to-black text-white p-12 text-center border-4 border-dashed border-zinc-800">
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Lumina
        </h1>
        <h2 className="text-3xl font-light text-zinc-400">Espacio Disponible</h2>
        <p className="mt-8 text-zinc-600">Esperando material publicitario...</p>
      </div>
    )
  }

  const currentMedia = playlist[currentIndex]
  const isImage = currentMedia ? /\.(jpg|jpeg|png|webp|gif)$/i.test(currentMedia) : false

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
        {/* Usamos img tag nativa */}
        <img 
          src={currentMedia} 
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
        key={currentMedia} // Force video element re-render on source change
        src={currentMedia}
        autoPlay
        muted
        playsInline // Important for iOS TV displays or PWA mode
        className="w-full h-full object-cover"
        onEnded={handleNext}
        onError={() => {
          console.error("Error playing video:", currentMedia)
          handleNext() // Skip broken videos immediately
        }}
      />
    </div>
  )
}
