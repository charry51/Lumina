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
import { Slider } from '@/components/ui/slider'
import MapSelector from '@/components/MapSelector'
import { createClient } from '@/lib/supabase/client'
import { calculateEstimatedImpacts, ScreenType, DensityLevel } from '@/lib/yield/pricing'

type Pantalla = {
  id: string
  nombre: string
  ubicacion: string
  ciudad: string
  latitud: number | null
  longitud: number | null
  precio_emision: number
  precio_base: number
  tipo_pantalla?: ScreenType
  densidad_poblacion_nivel?: DensityLevel
}

export default function CampaignForm({ pantallas, userPlan = 'Plan Básico' }: { pantallas: Pantalla[], userPlan?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedMapScreens, setSelectedMapScreens] = useState<string[]>([])
  
  // LumiAds v3 targets for estimation
  const [targetType, setTargetType] = useState<ScreenType>('gimnasio')
  const [targetDensity, setTargetDensity] = useState<DensityLevel>('medio')
  
  // Días de la semana (0=Dom, 1=Lun, ..., 6=Sab)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]) // Por defecto Lun-Vie
  
  // LuminAdd v2: Programmatic States
  const [presupuestoTotal, setPresupuestoTotal] = useState<number>(100)
  const [prioridad, setPrioridad] = useState<number>(1)
  const [duracion, setDuracion] = useState<number>(10)
  
  // Mapeo de frecuencia según plan para el estimador
  const planFrequency = userPlan.includes('Dominio') ? 4 : userPlan.includes('Expansión') ? 3 : userPlan.includes('Impacto') ? 2 : 1

  // Calculamos impactos basados en la selección o el target por defecto
  const selectedScreensFull = pantallas.filter(p => selectedMapScreens.includes(p.id))
  
  // Si hay pantallas seleccionadas, promediamos o usamos la más cara para ser conservadores
  const effType = selectedScreensFull.length > 0 ? (selectedScreensFull[0].tipo_pantalla || 'gimnasio') : targetType
  const effDensity = selectedScreensFull.length > 0 ? (selectedScreensFull[0].densidad_poblacion_nivel || 'medio') : targetDensity

  const impactosEstimados = calculateEstimatedImpacts({
    presupuestoTotal,
    prioridad,
    duracionSegundos: duracion,
    zona: 'standard', // Por simplicidad en el estimador inicial
    tipoPantalla: effType,
    densidadNivel: effDensity,
    frecuenciaRelativa: planFrequency
  })

  const isPremium = userPlan.toLowerCase().includes('expansión') || userPlan.toLowerCase().includes('dominio')

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

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

    // --- NEW: DURATION VALIDATION (5s - 30s) ---
    if (file.type.startsWith('video/')) {
      try {
        const video = document.createElement('video')
        video.preload = 'metadata'
        
        const videoDuration = await new Promise<number>((resolve, reject) => {
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src)
            resolve(video.duration)
          }
          video.onerror = () => reject('Error al cargar metadatos del video')
          video.src = URL.createObjectURL(file)
        })

        if (videoDuration < 5) {
          toast.error(`El video es demasiado corto (${Math.round(videoDuration)}s). El mínimo permitido es 5s.`)
          setIsLoading(false)
          return
        }
        if (videoDuration > 30.5) { // 0.5s margin for encoding variations
          toast.error(`El video es demasiado largo (${Math.round(videoDuration)}s). El máximo permitido es 30s.`)
          setIsLoading(false)
          return
        }
      } catch (err) {
        toast.error('No se pudo validar la duración del video. Intenta con otro archivo.')
        setIsLoading(false)
        return
      }
    }
    // --- END VALIDATION ---

    try {
      // 1. SUBIDA DIRECTA A SUPABASE STORAGE
      const supabase = createClient()
      setIsUploading(true)
      setUploadProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
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

      // LumiAds v2: Crear el payload JSON limpio con los nuevos campos programáticos
      const payloadData = {
        nombre_campana: formData.get('nombre_campana') as string,
        fecha_inicio: formData.get('fecha_inicio') as string,
        fecha_fin: formData.get('fecha_fin') as string,
        video_url: publicUrl,
        hora_inicio: (formData.get('hora_inicio') as string) || '',
        hora_fin: (formData.get('hora_fin') as string) || '',
        pantalla_id: (formData.get('pantalla_id') as string) || '',
        pantalla_idsRaw: (formData.get('pantalla_ids') as string) || '',
        dias_semana: selectedDays,
        presupuesto_total: presupuestoTotal,
        prioridad: prioridad,
        impactos_estimados: impactosEstimados,
        duracion_segundos: duracion
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
      
      {/* LumiAds v2.0 - Programmatic Dashboard Card */}
      <div className="bg-muted/50 border border-border rounded-xl p-6 shadow-2xl relative overflow-hidden cyber-glass shadow-[#7C3CFF]/10">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7C3CFF] to-transparent opacity-50" />
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <Label className="text-muted-foreground font-medium tracking-widest text-[10px] uppercase">Presupuesto de Campaña</Label>
                    <span className="text-xl font-heading text-foreground font-black">{presupuestoTotal}€</span>
                  </div>
                  <Slider 
                    defaultValue={[100]} 
                    max={5000} step={50} min={50}
                    onValueChange={(val: number[]) => setPresupuestoTotal(val[0])} 
                    className="mt-2"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <Label className="text-muted-foreground font-medium tracking-widest text-[10px] uppercase">Duración del Anuncio</Label>
                    <span className="text-xl font-heading text-foreground font-black">{duracion}s</span>
                  </div>
                  <Slider 
                    defaultValue={[10]} 
                    max={30} step={5} min={5}
                    onValueChange={(val: number[]) => setDuracion(val[0])} 
                    className="mt-2"
                  />
                  <p className="text-[9px] text-muted-foreground font-mono uppercase mt-1">Límite Protocolo: 5s - 30s</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground font-medium tracking-widest text-[10px] uppercase">Prioridad de Subasta</Label>
                  <Select value={prioridad.toString()} onValueChange={(val: any) => setPrioridad(parseInt(val))}>
                    <SelectTrigger className="bg-background border-border focus:border-[#7C3CFF] h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="1">Base (Eficiencia máxima)</SelectItem>
                      <SelectItem value="2">Acelerada (Gasto x2)</SelectItem>
                      <SelectItem value="3">Takeover (Impacto Crítico)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
            
            <div className="bg-background/80 rounded-lg p-6 border border-[#2BC8FF]/20 flex flex-col justify-center items-center text-center">
                <span className="text-[#2BC8FF] text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Retorno Estimado</span>
                {impactosEstimados > 0 ? (
                    <>
                        <span className="text-5xl font-heading text-foreground font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(124,60,255,0.3)]">
                            {impactosEstimados.toLocaleString()}
                        </span>
                        <div className="flex flex-col mt-2">
                           <span className="text-muted-foreground font-medium text-[10px] uppercase tracking-widest">Impactos Garantizados</span>
                           <span className="text-primary font-mono text-[9px] uppercase mt-1">Frecuencia Plan: {planFrequency}x</span>
                        </div>
                    </>
                ) : (
                    <span className="text-muted-foreground text-sm italic">Configura tu campaña...</span>
                )}
            </div>
         </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre_campana" className="text-muted-foreground font-medium">Nombre de la Creatividad</Label>
        <Input id="nombre_campana" name="nombre_campana" placeholder="Ej. Lanzamiento Perfume 2026" required disabled={isLoading} className="bg-background border-border focus:border-[#7C3CFF] text-foreground h-11" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_inicio" className="text-muted-foreground font-medium">Fecha de Inicio</Label>
          <Input id="fecha_inicio" name="fecha_inicio" type="date" required disabled={isLoading} className="bg-background border-border text-foreground h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fecha_fin" className="text-muted-foreground font-medium">Fecha de Fin</Label>
          <Input id="fecha_fin" name="fecha_fin" type="date" required disabled={isLoading} className="bg-background border-border text-foreground h-11" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-muted-foreground font-medium">Días de Emisión</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 1, label: 'Lun', full: 'Lunes' },
            { id: 2, label: 'Mar', full: 'Martes' },
            { id: 3, label: 'Mie', full: 'Miércoles' },
            { id: 4, label: 'Jue', full: 'Jueves' },
            { id: 5, label: 'Vie', full: 'Viernes' },
            { id: 6, label: 'Sab', full: 'Sábado' },
            { id: 0, label: 'Dom', full: 'Domingo' },
          ].map((day) => {
            const isSelected = selectedDays.includes(day.id)
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={`
                  flex-1 min-w-[60px] py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all duration-300
                  ${isSelected 
                    ? 'bg-[#00d2ff]/20 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_10px_rgba(0,210,255,0.3)]' 
                    : 'bg-background border-border text-muted-foreground hover:border-[#00d2ff]/50'
                  }
                `}
              >
                {day.label}
              </button>
            )
          })}
        </div>
        <p className="text-[9px] text-muted-foreground font-mono uppercase">Selecciona los días específicos en los que quieres que se emita tu anuncio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora_inicio" className="text-muted-foreground font-medium">Hora Inicio Emisión</Label>
          <Input id="hora_inicio" name="hora_inicio" type="time" defaultValue="00:00" required disabled={isLoading} className="bg-background border-border text-foreground h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hora_fin" className="text-muted-foreground font-medium">Hora Fin Emisión</Label>
          <Input id="hora_fin" name="hora_fin" type="time" defaultValue="23:59" required disabled={isLoading} className="bg-background border-border text-foreground h-11" />
        </div>
      </div>

      <div className="flex flex-col gap-4 relative z-0">
        <Label className="text-muted-foreground font-medium">Selección de Pantallas</Label>
        
         {isPremium ? (
          <div className="space-y-4">
             <div className="p-4 bg-[#2BC8FF]/5 border border-[#2BC8FF]/20 rounded-xl text-[#2BC8FF] mb-2 flex items-center justify-between">
                <div>
                   <p className="font-bold flex items-center gap-2">✨ Multi-Selección Premium <span className="text-[8px] bg-[#2BC8FF] text-black px-1.5 py-0.5 rounded">PRO</span></p>
                   <p className="text-[11px] opacity-70">Selecciona las pantallas disponibles en el mapa.</p>
                </div>
                {selectedMapScreens.length > 0 && (
                    <span className="bg-[#2BC8FF] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        {selectedMapScreens.length} Seleccionadas
                    </span>
                )}
             </div>
             <div className="h-[400px] rounded-xl overflow-hidden border border-border">
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
            <SelectTrigger className="bg-background border-border text-foreground h-11">
              <SelectValue placeholder="Selecciona una pantalla de la lista..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
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
        <Label htmlFor="video" className="text-muted-foreground font-medium tracking-tight">Archivo (Imagen o Video)</Label>
        <Input id="video" name="video" type="file" required disabled={isLoading} accept="image/*,video/mp4" className="bg-background border-border text-foreground h-12 file:text-foreground file:font-semibold" />
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Resolución sugerida: 1920x1080 (HD)</p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 shadow-[0_0_10px_rgba(124,60,255,0.5)]" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono text-center uppercase tracking-widest">
            Subiendo archivo: {uploadProgress}%
          </p>
        </div>
      )}

      <button type="submit" className="cyber-button-ui mt-6 font-black h-12 uppercase tracking-widest text-[11px]" disabled={isLoading}>
        {isLoading ? (isUploading ? 'Subiendo Media...' : 'Procesando IA...') : 'Lanzar Campaña'}
      </button>
    </form>
  )
}


