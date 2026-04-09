'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPantalla } from './actions'
import { PairingForm } from './PairingForm'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tv, MapPin } from 'lucide-react'

export function NuevaPantallaForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'manual' | 'vincular'>('vincular')
  const [esPublica, setEsPublica] = useState(true)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('es_publica', esPublica.toString())
    
    if (!formData.get('nombre') || !formData.get('ciudad') || !formData.get('latitud') || !formData.get('longitud')) {
        toast.error('Nombre, Ciudad, Latitud y Longitud son requeridos');
        setLoading(false);
        return;
    }

    const res = await createPantalla(formData)
    
    if (res.success) {
      toast.success('Pantalla añadida correctamente')
      setOpen(false)
    } else {
      toast.error('Error: ' + res.error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-[#D4AF37] text-black hover:bg-[#b08d24] font-bold">
            + Añadir Pantalla
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[480px] bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-widest text-sm">Nueva Pantalla en la Red</DialogTitle>
        </DialogHeader>

        {/* Pestañas */}
        <div className="flex gap-1 p-1 bg-zinc-950 rounded-lg mt-2">
          <button
            onClick={() => setTab('vincular')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === 'vincular' 
                ? 'bg-primary text-black shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Tv className="w-3.5 h-3.5" /> Vincular TV
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === 'manual' 
                ? 'bg-zinc-700 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Manual
          </button>
        </div>

        {/* Contenido de pairing */}
        {tab === 'vincular' && (
          <PairingForm />
        )}

        {/* Formulario manual */}
        {tab === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-zinc-400 text-xs uppercase tracking-widest">Nombre Público</Label>
              <Input id="nombre" name="nombre" placeholder="Ej: LED Centro Comercial" className="bg-zinc-950 border-zinc-800" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad" className="text-zinc-400 text-xs uppercase tracking-widest">Ciudad</Label>
              <Input id="ciudad" name="ciudad" placeholder="Ej: Madrid" className="bg-zinc-950 border-zinc-800" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ubicacion" className="text-zinc-400 text-xs uppercase tracking-widest">Ubicación Fina</Label>
              <Input id="ubicacion" name="ubicacion" placeholder="Ej: Planta 2, Zona Restauración" className="bg-zinc-950 border-zinc-800" disabled={loading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="latitud" className="text-zinc-400 text-xs uppercase tracking-widest">Latitud</Label>
                  <Input id="latitud" name="latitud" placeholder="40.4168" type="number" step="any" className="bg-zinc-950 border-zinc-800" disabled={loading} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="longitud" className="text-zinc-400 text-xs uppercase tracking-widest">Longitud</Label>
                  <Input id="longitud" name="longitud" placeholder="-3.7038" type="number" step="any" className="bg-zinc-950 border-zinc-800" disabled={loading} />
              </div>
            </div>
            <div className="flex flex-col gap-2 py-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Visibilidad Marketplace</Label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  <button
                      type="button"
                      onClick={() => setEsPublica(true)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-lg border transition-all ${
                          esPublica 
                              ? 'bg-primary/20 border-primary/50 text-white' 
                              : 'border-transparent text-zinc-500 hover:text-zinc-400'
                      }`}
                  >
                      <span className="text-[10px] font-black uppercase tracking-tighter">🌐 Pública</span>
                      <span className="text-[8px] opacity-60 uppercase">Disponible</span>
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
                      <span className="text-[8px] opacity-60 uppercase">Uso Propio</span>
                  </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#D4AF37] text-black hover:bg-[#b08d24] font-black uppercase tracking-widest" disabled={loading}>
              {loading ? 'Guardando...' : 'Añadir a Inventario'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
