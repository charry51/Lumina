'use client'

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

type Pantalla = {
  id: string
  nombre: string
  ubicacion: string
}

export default function CampaignForm({ pantallas }: { pantallas: Pantalla[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    
    // Server action returns an object { type, message }
    try {
      const result = await createCampaign(null, formData)
      
      if (result.type === 'error') {
        toast.error(result.message)
      } else {
        toast.success(result.message)
        // Redirigir al dashboard y refrescar cache
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre_campana">Nombre de la Campaña</Label>
        <Input id="nombre_campana" name="nombre_campana" placeholder="Ej. Promoción Verano 2026" required disabled={isLoading} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
          {/* Usamos date nativo para evitar complejidades extra, mantiene estética de sistema */}
          <Input id="fecha_inicio" name="fecha_inicio" type="date" required disabled={isLoading} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_fin">Fecha de Fin</Label>
          <Input id="fecha_fin" name="fecha_fin" type="date" required disabled={isLoading} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pantalla_id">Pantalla de Destino</Label>
        <Select name="pantalla_id" required disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una pantalla..." />
          </SelectTrigger>
          <SelectContent>
            {pantallas.length === 0 ? (
              <SelectItem value="default" disabled>No hay pantallas disponibles</SelectItem>
            ) : (
              pantallas.map((pantalla) => (
                <SelectItem key={pantalla.id} value={pantalla.id}>
                  {pantalla.nombre} - {pantalla.ubicacion}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="video">Archivo (Imagen o Video)</Label>
        <Input id="video" name="video" type="file" required disabled={isLoading} accept="image/*,video/mp4" />
        <p className="text-xs text-zinc-500">Sube material estático o MP4 para reproducir en bucle.</p>
      </div>

      <Button type="submit" className="mt-4" disabled={isLoading}>
        {isLoading ? 'Subiendo e Inicializando...' : 'Crear Campaña'}
      </Button>
    </form>
  )
}
