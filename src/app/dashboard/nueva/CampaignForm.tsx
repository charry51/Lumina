import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCampaign } from './actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MapSelector from '@/components/MapSelector'

type Pantalla = {
  id: string
  nombre: string
  ubicacion: string
  ciudad: string
  latitud: number | null
  longitud: number | null
}

export default function CampaignForm({ pantallas, userPlan = 'Plan Básico' }: { pantallas: Pantalla[], userPlan?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMapScreen, setSelectedMapScreen] = useState<string | null>(null)

  const isPremium = userPlan.toLowerCase().includes('expansión') || userPlan.toLowerCase().includes('dominio')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    
    // Si usamos mapa, inyectamos el ID manualmente si no está en el form
    if (isPremium && selectedMapScreen) {
      formData.set('pantalla_id', selectedMapScreen)
    }

    if (isPremium && !formData.get('pantalla_id')) {
        toast.error('Debes seleccionar una pantalla en el mapa.')
        setIsLoading(false)
        return
    }
    
    try {
      const result = await createCampaign(null, formData)
      
      if (result.type === 'error') {
        toast.error(result.message)
      } else {
        toast.success(result.message)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado al enviar el formulario.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre_campana">Nombre de la Campaña</Label>
        <Input id="nombre_campana" name="nombre_campana" placeholder="Ej. Promoción Verano 2026" required disabled={isLoading} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
          <Input id="fecha_inicio" name="fecha_inicio" type="date" required disabled={isLoading} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_fin">Fecha de Fin</Label>
          <Input id="fecha_fin" name="fecha_fin" type="date" required disabled={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora_inicio">Hora Inicio Emisión</Label>
          <Input id="hora_inicio" name="hora_inicio" type="time" defaultValue="00:00" required disabled={isLoading} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora_fin">Hora Fin Emisión</Label>
          <Input id="hora_fin" name="hora_fin" type="time" defaultValue="23:59" required disabled={isLoading} />
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-0">
        <Label>Pantalla de Destino</Label>
        
        {isPremium ? (
          <div className="space-y-3">
             <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37] rounded-lg text-[#b08d24] mb-2 flex items-center justify-between">
                <div>
                   <p className="font-bold">✨ Funcionalidad Pro: Selección Satélite</p>
                   <p className="text-xs text-yellow-700">Explora nuestro inventario geolocalizado.</p>
                </div>
                {selectedMapScreen && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">¡Selección Lista!</span>
                )}
             </div>
             <MapSelector 
                pantallas={pantallas} 
                onSelectPantalla={(id) => setSelectedMapScreen(id)}
                selectedId={selectedMapScreen}
             />
             {/* Componente hidden para enganchar el estado con el FormData */}
             <input type="hidden" name="pantalla_id" value={selectedMapScreen || ''} required />
          </div>
        ) : (
          <Select name="pantalla_id" required disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una pantalla de la lista..." />
            </SelectTrigger>
            <SelectContent>
              {pantallas.length === 0 ? (
                <SelectItem value="default" disabled>No hay pantallas disponibles</SelectItem>
              ) : (
                pantallas.map((pantalla) => (
                  <SelectItem key={pantalla.id} value={pantalla.id}>
                    {pantalla.ciudad} - {pantalla.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="video">Archivo (Imagen o Video)</Label>
        <Input id="video" name="video" type="file" required disabled={isLoading} accept="image/*,video/mp4" />
        <p className="text-xs text-zinc-500">Sube material estático o MP4 para reproducir en bucle.</p>
      </div>

      <Button type="submit" className="mt-4 bg-zinc-900 hover:bg-black text-white" disabled={isLoading}>
        {isLoading ? 'Subiendo...' : 'Crear Campaña'}
      </Button>
    </form>
  )
}
