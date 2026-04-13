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
import MapSelector from '@/components/MapSelector'
import { createClient } from '@/lib/supabase/client' // Cliente del navegador

type Pantalla = {
  id: string
  nombre: string
  ubicacion: string
  ciudad: string
  latitud: number | null
  longitud: number | null
  precio_emision: number
  precio_base: number
}

export default function CampaignForm({ pantallas, userPlan = 'Plan Básico' }: { pantallas: Pantalla[], userPlan?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedMapScreens, setSelectedMapScreens] = useState<string[]>([])

  const isPremium = userPlan.toLowerCase().includes('expansión') || userPlan.toLowerCase().includes('dominio')

  const toggleScreen = (id: string) => {
    setSelectedMapScreens(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const file = formData.get('video') as File
    
    // Si es premium, usamos la lista del mapa
    if (isPremium) {
      if (selectedMapScreens.length === 0) {
        toast.error('Debes seleccionar al menos una pantalla en el mapa.')
        setIsLoading(false)
        return
      }
      formData.set('pantalla_ids', selectedMapScreens.join(','))
    }

    if (!file || file.size === 0) {
      toast.error('Debes seleccionar un archivo de video o imagen.')
      setIsLoading(false)
      return
    }

    try {
      // 1. SUBIDA DIRECTA A SUPABASE STORAGE
      const supabase = createClient()
      setIsUploading(true)
      setUploadProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${self.crypto.randomUUID()}.${fileExt}`
      const filePath = `${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creatividades')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Nota: El SDK de Supabase ahora soporta onUploadProgress en navegadores modernos
          // @ts-ignore
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percent))
          }
        })

      if (uploadError) {
        throw new Error(`Error en Storage: ${uploadError.message}`)
      }

      // 2. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('creatividades')
        .getPublicUrl(uploadData.path)

      // 3. Crear el payload JSON limpio sin el archivo
      const payloadData = {
        nombre_campana: formData.get('nombre_campana') as string,
        fecha_inicio: formData.get('fecha_inicio') as string,
        fecha_fin: formData.get('fecha_fin') as string,
        video_url: publicUrl,
        hora_inicio: (formData.get('hora_inicio') as string) || '',
        hora_fin: (formData.get('hora_fin') as string) || '',
        pantalla_id: (formData.get('pantalla_id') as string) || '',
        pantalla_idsRaw: (formData.get('pantalla_ids') as string) || ''
      }

      const result = await createCampaign(payloadData)
      
      if (result.type === 'error') {
        toast.error(result.message)
      } else {
        toast.success(result.message)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error al crear campaña:', error)
      toast.error(`Error: ${error.message || 'Consulta la consola'}`)
    } finally {
      setIsLoading(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-sm">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre_campana" className="text-zinc-400 font-medium">Nombre de la Campaña</Label>
        <Input id="nombre_campana" name="nombre_campana" placeholder="Ej. Promoción Verano 2026" required disabled={isLoading} className="bg-zinc-900 border-zinc-800 focus:border-[#D4AF37] text-zinc-100 h-11" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_inicio" className="text-zinc-400 font-medium">Fecha de Inicio</Label>
          <Input id="fecha_inicio" name="fecha_inicio" type="date" required disabled={isLoading} className="bg-zinc-900 border-zinc-800 text-zinc-100 h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_fin" className="text-zinc-400 font-medium">Fecha de Fin</Label>
          <Input id="fecha_fin" name="fecha_fin" type="date" required disabled={isLoading} className="bg-zinc-900 border-zinc-800 text-zinc-100 h-11" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora_inicio" className="text-zinc-400 font-medium">Hora Inicio Emisión</Label>
          <Input id="hora_inicio" name="hora_inicio" type="time" defaultValue="00:00" required disabled={isLoading} className="bg-zinc-900 border-zinc-800 text-zinc-100 h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora_fin" className="text-zinc-400 font-medium">Hora Fin Emisión</Label>
          <Input id="hora_fin" name="hora_fin" type="time" defaultValue="23:59" required disabled={isLoading} className="bg-zinc-900 border-zinc-800 text-zinc-100 h-11" />
        </div>
      </div>

      <div className="flex flex-col gap-4 relative z-0">
        <Label className="text-zinc-400 font-medium">Selección de Pantallas</Label>
        
        {isPremium ? (
          <div className="space-y-4">
             <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37] mb-2 flex items-center justify-between">
                <div>
                   <p className="font-bold flex items-center gap-2">✨ Multi-Selección Premium <span className="text-[8px] bg-[#D4AF37] text-black px-1.5 py-0.5 rounded">PRO</span></p>
                   <p className="text-[11px] opacity-70">Selecciona las pantallas disponibles en el mapa.</p>
                </div>
                {selectedMapScreens.length > 0 && (
                    <span className="bg-[#D4AF37] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {selectedMapScreens.length} Seleccionadas
                    </span>
                )}
             </div>
             <div className="h-[400px] rounded-xl overflow-hidden border border-zinc-800">
               <MapSelector 
                  pantallas={pantallas} 
                  onTogglePantalla={toggleScreen}
                  selectedIds={selectedMapScreens}
               />
             </div>
             <input type="hidden" name="pantalla_id" value={selectedMapScreens[0] || ''} />
          </div>
        ) : (
          <Select name="pantalla_id" required disabled={isLoading}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100 h-11">
              <SelectValue placeholder="Selecciona una pantalla de la lista..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              {pantallas.length === 0 ? (
                <SelectItem value="default" disabled>No hay pantallas disponibles</SelectItem>
              ) : (
                pantallas.map((pantalla) => {
                  const isHighDemand = pantalla.precio_emision > (pantalla.precio_base || 50)
                  return (
                    <SelectItem key={pantalla.id} value={pantalla.id} className="focus:bg-primary/10">
                      <div className="flex justify-between items-center w-full">
                        <span>{pantalla.ciudad} - {pantalla.nombre}</span>
                        {isHighDemand && (
                          <span className="ml-2 text-[8px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                            ⚡ ALTA DEMANDA
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  )
                })
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="video" className="text-zinc-400 font-medium tracking-tight">Archivo (Imagen o Video)</Label>
        <Input id="video" name="video" type="file" required disabled={isLoading} accept="image/*,video/mp4" className="bg-zinc-900 border-zinc-800 text-zinc-100 h-12 file:text-zinc-100 file:font-semibold" />
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Resolución sugerida: 1920x1080 (HD)</p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,210,255,0.5)]" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 font-mono text-center uppercase tracking-widest">
            Subiendo archivo: {uploadProgress}%
          </p>
        </div>
      )}

      <Button type="submit" className="mt-6 bg-[#D4AF37] hover:bg-[#b08d24] text-black font-black h-12 uppercase tracking-widest text-xs" disabled={isLoading}>
        {isLoading ? (isUploading ? 'Subiendo Media...' : 'Procesando IA...') : 'Lanzar Campaña'}
      </Button>
    </form>
  )
}
