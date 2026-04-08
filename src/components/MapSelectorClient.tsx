'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom Icon for Selected Screen
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type Pantalla = {
  id: string
  nombre: string
  ubicacion: string
  ciudad: string
  latitud: number | null
  longitud: number | null
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

export default function MapSelectorClient({ 
  pantallas, 
  onTogglePantalla,
  selectedIds = []
}: { 
  pantallas: Pantalla[],
  onTogglePantalla: (id: string) => void,
  selectedIds: string[]
}) {
  // Centro aproximado de España por defecto
  const [center, setCenter] = useState<[number, number]>([40.4168, -3.7038])

  // Centrar el mapa en la primera pantalla disponible con coordenadas
  useEffect(() => {
    const p = pantallas.find(p => p.latitud && p.longitud)
    if (p && p.latitud && p.longitud) {
      setCenter([p.latitud, p.longitud])
    }
  }, [pantallas])

  const pantallasConGeo = pantallas.filter(p => p.latitud !== null && p.longitud !== null)

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border border-zinc-200 border-zinc-800 shadow-inner relative z-0">
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} zoom={6} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {pantallasConGeo.map((pantalla) => {
          const isSelected = selectedIds.includes(pantalla.id)
          
          return (
            <Marker 
              key={pantalla.id} 
              position={[pantalla.latitud!, pantalla.longitud!]}
              icon={isSelected ? selectedIcon : new L.Icon.Default()}
              eventHandlers={{
                  click: () => {
                      onTogglePantalla(pantalla.id)
                  },
              }}
            >
              <Popup>
                <div className="text-sm font-[family-name:var(--font-geist-sans)] dark:text-zinc-900">
                  <p className="font-bold">{pantalla.nombre}</p>
                  <p className="opacity-70">{pantalla.ubicacion}</p>
                  <button 
                    type="button"
                    onClick={() => onTogglePantalla(pantalla.id)}
                    className={`mt-2 w-full px-2 py-1.5 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                      isSelected 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'bg-zinc-900 text-white hover:bg-black'
                    }`}
                  >
                    {isSelected ? 'Quitar Selección' : 'Seleccionar Pantalla'}
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
