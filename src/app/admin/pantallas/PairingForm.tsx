'use client'

import { useState, useEffect } from 'react'
import { activatePairingCode } from '@/app/vincular/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tv, Loader2, CheckCircle2, MapPin } from 'lucide-react'
import MapSelector from '@/components/MapSelector'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PairingForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [nombre, setNombre] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [esPublica, setEsPublica] = useState(true)
  const [tipoPantalla, setTipoPantalla] = useState('gimnasio')
  const [densidadNivel, setDensidadNivel] = useState('medio')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  // Auto-busqueda en mapa cuando cambia la ciudad (debounce 1s)
  useEffect(() => {
    if (!ciudad || ciudad.trim().length < 4) return
    const delayDebounceFn = setTimeout(async () => {
      setGeocoding(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(ciudad)}&limit=1`)
        const data = await res.json()
        if (data && data.length > 0) {
          const result = data[0]
          setCoords({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) })

          // --- SMART DETECTION LOGIC ---
          const lowerAddr = result.display_name.toLowerCase()
          const addrObj = result.address || {}
          
          // 1. Detect Category (tipo_pantalla)
          let detectedType = ''
          const mainStreetKeywords = ['avenida', 'gran via', 'plaza', 'mayor', 'diagonal', 'recoletos', 'castellana', 'square', 'broadway', 'boulevard', 'pau claris']
          const restaurantKeywords = ['restaurante', 'restaurant', 'grill', 'pizza', 'burger', 'comida', 'steakhouse', 'asador']
          const barKeywords = ['bar', 'pub', 'cafe', 'beer', 'bodega', 'taberna', 'cerveceria']
          
          if (mainStreetKeywords.some(k => lowerAddr.includes(k))) {
            detectedType = 'calle_principal'
          } else if (restaurantKeywords.some(k => lowerAddr.includes(k))) {
            detectedType = 'restaurante'
          } else if (barKeywords.some(k => lowerAddr.includes(k))) {
            detectedType = 'bar'
          }

          if (detectedType) setTipoPantalla(detectedType)

          // 2. Detect Density (densidad_poblacion_nivel)
          let detectedDensity = ''
          const hugeCities = ['madrid', 'barcelona', 'london', 'paris', 'berlin', 'new york', 'roma', 'sevilla', 'valencia', 'malaga']
          const touristHubs = ['marbella', 'benidorm', 'ibiza', 'palma', 'adeje', 'torremolinos', 'salou', 'nerja', 'santiago de compostela', 'granada', 'cordoba', 'san sebastian']
          const highDensityTowns = ['hospitalet', 'badalona', 'santa coloma', 'mislata', 'burjassot', 'benetusser']
          
          const touristKeywords = ['playa', 'beach', 'catedral', 'palacio', 'puerto', 'muelle', 'alhambra', 'sagrada familia', 'monumento', 'museum', 'museo', 'landmark', 'teatro', 'basilica', 'casco antiguo', 'historic']
          
          const cityName = (addrObj.city || addrObj.town || addrObj.municipality || '').toLowerCase()
          const isHugeCity = hugeCities.some(c => cityName.includes(c) || lowerAddr.includes(c))
          const isTouristHub = touristHubs.some(c => cityName.includes(c) || lowerAddr.includes(c))
          const isHighDensityTown = highDensityTowns.some(c => cityName.includes(c) || lowerAddr.includes(c))
          const isMainStreet = mainStreetKeywords.some(k => lowerAddr.includes(k))
          const hasTouristMarker = touristKeywords.some(k => lowerAddr.includes(k))
          
          // SCORING LOGIC
          if ((isHugeCity || isTouristHub || isHighDensityTown) && isMainStreet) {
            detectedDensity = 'muy_alto'
          } else if (isTouristHub && hasTouristMarker) {
            detectedDensity = 'muy_alto'
          } else if (isHugeCity) {
            if (result.type === 'residential' || result.type === 'living_street') {
              detectedDensity = 'medio'
            } else {
              detectedDensity = 'alto'
            }
          } else if (isTouristHub || isHighDensityTown || addrObj.city || result.type === 'city') {
            detectedDensity = (isMainStreet || hasTouristMarker) ? 'alto' : 'medio'
          } else if (addrObj.village || addrObj.hamlet) {
            detectedDensity = hasTouristMarker ? 'medio' : 'bajo'
          } else {
            detectedDensity = 'medio'
          }

          if (detectedDensity) setDensidadNivel(detectedDensity)
        }
      } catch (err) {
        console.error("Geocoding error:", err)
      } finally {
        setGeocoding(false)
      }
    }, 1000)
    return () => clearTimeout(delayDebounceFn)
  }, [ciudad])

  const handleActivate = async () => {
    if (!code || code.length < 6) {
      toast.error('Introduce el código de 6 caracteres que aparece en la TV')
      return
    }
    if (!nombre || !ciudad) {
      toast.error('El nombre y la ciudad son obligatorios')
      return
    }

    if (esPublica && !coords) {
      toast.error('Para pantallas públicas es obligatorio marcar la ubicación en el mapa')
      return
    }

    setLoading(true)
    const result = await activatePairingCode(
      code, 
      nombre, 
      ciudad, 
      ubicacion || ciudad, 
      esPublica,
      coords?.lat,
      coords?.lng,
      tipoPantalla,
      densidadNivel
    )

    if (result.success) {
      setSuccess(true)
      toast.success('¡Pantalla vinculada! La TV redirigirá automáticamente al reproductor.')
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } else {
      toast.error(result.error || 'Error al vincular. Comprueba el código.')
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400" />
        <p className="text-green-400 font-heading font-black uppercase tracking-widest text-sm">¡Vinculada con éxito!</p>
        <p className="text-zinc-500 text-xs">La TV se está conectando al reproductor...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-[10px] text-primary font-mono uppercase tracking-widest flex items-center gap-2">
          <Tv className="w-3 h-3" />
          Enciende la TV y abre <strong>lumina.app/vincular</strong> en el navegador.
          Verás un código de 6 caracteres. Introdúcelo aquí.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-zinc-400 text-xs uppercase tracking-widest">Código de la TV</Label>
        <Input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="LM-4F9"
          maxLength={6}
          className="bg-zinc-900 border-zinc-800 text-white text-2xl font-mono h-14 tracking-[0.5em] uppercase text-center focus:border-primary"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label className="text-zinc-400 text-xs uppercase tracking-widest">Nombre de la Pantalla</Label>
          <Input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: TV Recepción Bar"
            className="bg-zinc-900 border-zinc-800 text-white h-10"
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-zinc-400 text-xs uppercase tracking-widest">Dirección completa</Label>
          <Input
            value={ciudad}
            onChange={e => setCiudad(e.target.value)}
            placeholder="Ej: Madrid, C/ Mayor 1"
            className="bg-zinc-900 border-zinc-800 text-white h-10"
            disabled={loading}
          />
        </div>
      </div>

      {/* LUMINA v3.0: Categorización Categoría y Densidad */}
      <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label className="text-zinc-400 text-xs uppercase tracking-widest">Tipo de Establecimiento</Label>
            <Select value={tipoPantalla} onValueChange={(v) => setTipoPantalla(v ?? 'bar')}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-10 text-[11px] uppercase font-bold tracking-tight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="bar">Bar (Standard)</SelectItem>
                <SelectItem value="gimnasio">Gimnasio</SelectItem>
                <SelectItem value="restaurante">Restaurante</SelectItem>
                <SelectItem value="calle">Calle</SelectItem>
                <SelectItem value="centro_comercial">Centro Comercial</SelectItem>
                <SelectItem value="calle_principal">Calle Principal (Elite)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-zinc-400 text-xs uppercase tracking-widest">Densidad Población</Label>
            <Select value={densidadNivel} onValueChange={(v) => setDensidadNivel(v ?? 'medio')}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-10 text-[11px] uppercase font-bold tracking-tight">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="bajo">Baja Densidad</SelectItem>
                <SelectItem value="medio">Media</SelectItem>
                <SelectItem value="alto">Alta</SelectItem>
                <SelectItem value="muy_alto">Muy Alta / Capital</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-zinc-400 text-xs uppercase tracking-widest">Ubicación / Descripción</Label>
        <Input
          value={ubicacion}
          onChange={e => setUbicacion(e.target.value)}
          placeholder="Ej: Entrada principal, a la derecha"
          className="bg-zinc-900 border-zinc-800 text-white h-10"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-zinc-400 text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-primary" /> Posición en el Mapa
            {geocoding && <span className="text-[9px] text-zinc-500 animate-pulse ml-2 lowercase">buscando...</span>}
        </Label>
        <div className="rounded-xl overflow-hidden border border-zinc-800 h-[200px] bg-zinc-950">
            <MapSelector 
                onSelect={(lat, lng) => setCoords({ lat, lng })}
                externalPosition={coords}
            />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Visibilidad de la Pantalla</Label>
        <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
                type="button"
                onClick={() => setEsPublica(true)}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg border transition-all ${
                    esPublica 
                        ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_15px_rgba(0,210,255,0.1)]' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-400'
                }`}
            >
                <span className="text-[10px] font-black uppercase tracking-tighter">🌐 Pública</span>
                <span className="text-[8px] opacity-60 uppercase">Monetizar</span>
            </button>
            <button
                type="button"
                onClick={() => setEsPublica(false)}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg border transition-all ${
                    !esPublica 
                        ? 'bg-zinc-800 border-zinc-700 text-white' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-400'
                }`}
            >
                <span className="text-[10px] font-black uppercase tracking-tighter">🔒 Privada</span>
                <span className="text-[8px] opacity-60 uppercase">Uso Interno</span>
            </button>
        </div>
      </div>

      <Button
        onClick={handleActivate}
        disabled={loading}
        className="bg-primary hover:bg-primary/90 text-black font-black h-12 uppercase tracking-widest text-xs mt-2 shadow-[0_0_20px_rgba(0,210,255,0.2)]"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Vinculando...</>
        ) : (
          <><Tv className="w-4 h-4 mr-2" /> Activar Pantalla Premium</>
        )}
      </Button>
    </div>
  )
}
