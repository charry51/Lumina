'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { createSupportTicket, analyzeTicketMessage, TicketCategory, TicketPriority } from '@/app/actions/support'
import { toast } from 'sonner'
import { LifeBuoy, Loader2, Upload, Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function NewTicketDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null)
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('Otros')
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('MEDIA')
  const supabase = createClient()

  const handleManualAnalysis = async (text: string) => {
    if (text.length < 10) return
    setIsAnalyzing(true)
    const result = await analyzeTicketMessage(text)
    setTicketCategory(result.categoria)
    setTicketPriority(result.prioridad)
    setIsAnalyzing(false)
    toast.info('IA: Categoría y prioridad ajustadas automáticamente')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `tickets/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('support-attachments')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Error al subir archivo: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('support-attachments')
      .getPublicUrl(filePath)

    setArchivoUrl(publicUrl)
    setUploading(false)
    toast.success('Archivo subido')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const text = formData.get('mensaje') as string

    // Guaranty AI classification is complete and accurate before submission
    let finalCategoria = ticketCategory
    let finalPrioridad = ticketPriority

    if (text && text.length >= 10) {
       const result = await analyzeTicketMessage(text)
       finalCategoria = result.categoria
       finalPrioridad = result.prioridad
    }

    formData.set('categoria', finalCategoria)
    formData.set('prioridad', finalPrioridad)
    if (archivoUrl) formData.append('archivo_url', archivoUrl)

    const res = await createSupportTicket(formData)
    if (res.success) {
      toast.success('Ticket creado correctamente. El soporte te responderá pronto.')
      setOpen(false)
      setArchivoUrl(null)
      // Reset defaults
      setTicketCategory('Otros')
      setTicketPriority('MEDIA')
    } else {
      toast.error(res.error || 'Error al crear ticket')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-[#00d2ff] text-black hover:bg-[#00d2ff]/90 font-black uppercase tracking-widest text-[10px] gap-2 px-6 h-12 shadow-[0_0_20px_rgba(0,210,255,0.2)] transition-all active:scale-95">
          <LifeBuoy className="w-4 h-4" /> Nuevo Ticket de Soporte
        </Button>
      } />
      <DialogContent className="bg-zinc-950 border-zinc-900 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#00d2ff] font-heading font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
            Abrir Incidencia Técnica
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Clasificación LuminAdd AI</span>
              {isAnalyzing && <Loader2 className="w-3 h-3 text-[#00d2ff] animate-spin" />}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {ticketCategory !== 'Otros' || ticketPriority !== 'MEDIA' ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00d2ff]/10 border border-[#00d2ff]/30 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" />
                    <span className="text-[10px] text-[#00d2ff] font-black uppercase tracking-tighter">{ticketCategory}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full">
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter">Prioridad: {ticketPriority}</span>
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-zinc-600 italic uppercase">Escribe la descripción para que la IA clasifique tu ticket automáticamente...</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Asunto</Label>
            <Input 
              name="asunto" 
              required 
              placeholder="Ej: Problema con la carga de videos en TV 1" 
              className="bg-zinc-900 border-zinc-800 h-11 text-sm focus-visible:ring-[#00d2ff]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Descripción del Problema</Label>
              {isAnalyzing && (
                <span className="text-[9px] text-[#00d2ff] font-bold animate-pulse flex items-center gap-1">
                  <Loader2 className="w-2 h-2 animate-spin" /> ✨ IA ANALIZANDO...
                </span>
              )}
            </div>
            <Textarea 
              name="mensaje" 
              required 
              onBlur={(e) => handleManualAnalysis(e.target.value)}
              placeholder="Describe lo que sucede con el máximo detalle posible..." 
              className="bg-zinc-900 border-zinc-800 min-h-[120px] text-sm leading-relaxed focus-visible:ring-[#00d2ff]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Adjuntar Foto (Opcional)</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  disabled={uploading}
                  className="hidden" 
                  id="ticket-photo"
                />
                <label 
                  htmlFor="ticket-photo"
                  className="flex items-center justify-between px-4 h-11 bg-zinc-900 border border-zinc-800 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors text-xs text-zinc-400"
                >
                  <span className="flex items-center gap-2">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Paperclip className="w-3 h-3" />}
                    {archivoUrl ? 'Foto lista ✓' : (uploading ? 'Subiendo...' : 'Seleccionar archivo')}
                  </span>
                  <Upload className="w-3 h-3 opacity-50" />
                </label>
              </div>
              {archivoUrl && (
                <div className="w-11 h-11 rounded border border-primary/30 overflow-hidden">
                  <img src={archivoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)} 
              className="text-[10px] uppercase font-bold text-zinc-500 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading} 
              className="bg-[#00d2ff] text-black hover:bg-[#00d2ff]/80 font-black uppercase tracking-widest text-[10px] px-8 h-11"
            >
              {loading ? (
                <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Creando...</>
              ) : (
                'Abrir Ticket'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


