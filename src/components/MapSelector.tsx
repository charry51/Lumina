import dynamic from 'next/dynamic'
import type { MapSelectorProps } from './MapSelectorClient'

// Evitar el error de "window is not defined" renderizando Leaflet solo en el cliente
const MapSelectorClient = dynamic(() => import('./MapSelectorClient'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center animate-pulse">
      <span className="text-zinc-400">Cargando mapa interactivo...</span>
    </div>
  )
})

export default function MapSelector(props: MapSelectorProps) {
  return <MapSelectorClient {...props} />
}
