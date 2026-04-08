'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPantalla } from './actions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function NuevaPantallaForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // Validar en cliente rápidamente
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
      <DialogTrigger asChild>
        <Button className="bg-[#D4AF37] text-black hover:bg-[#b08d24] font-bold">
          + Registrar Pantalla Física
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Nueva Pantalla en la Red</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-zinc-400">Nombre Público</Label>
            <Input id="nombre" name="nombre" placeholder="Ej: LED Centro Comercial" className="bg-zinc-950 border-zinc-800" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ciudad" className="text-zinc-400">Ciudad</Label>
            <Input id="ciudad" name="ciudad" placeholder="Ej: Madrid" className="bg-zinc-950 border-zinc-800" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ubicacion" className="text-zinc-400">Ubicación Fina (Opcional)</Label>
            <Input id="ubicacion" name="ubicacion" placeholder="Ej: Planta 2, Zona Restauración" className="bg-zinc-950 border-zinc-800" disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="latitud" className="text-zinc-400">Latitud</Label>
                <Input id="latitud" name="latitud" placeholder="40.4168" type="number" step="any" className="bg-zinc-950 border-zinc-800" disabled={loading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="longitud" className="text-zinc-400">Longitud</Label>
                <Input id="longitud" name="longitud" placeholder="-3.7038" type="number" step="any" className="bg-zinc-950 border-zinc-800" disabled={loading} />
            </div>
          </div>
          <Button type="submit" className="w-full bg-[#D4AF37] text-black hover:bg-[#b08d24]" disabled={loading}>
            {loading ? 'Guardando...' : 'Añadir a Inventario'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
