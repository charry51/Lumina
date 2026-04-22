'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteSupportTicket } from '@/app/actions/support'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteSupportTicket(ticketId)
    if (res.success) {
      toast.success('Ticket eliminado permanentemente')
      router.push('/admin/soporte')
    } else {
      toast.error(res.error || 'Error al eliminar')
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 gap-2 h-9 text-[10px] uppercase font-black tracking-widest">
          <Trash2 className="w-3.5 h-3.5" /> Borrar Incidencia
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-950 border-zinc-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500 uppercase font-black italic tracking-tighter">¿Confirmar eliminación absoluta?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400 text-xs">
            Esta acción borrará el ticket y todo su historial de mensajes de forma permanente en la base de datos. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-white uppercase text-[10px] font-black">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={loading}
            className="bg-red-500 text-white hover:bg-red-600 uppercase text-[10px] font-black"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Trash2 className="w-3 h-3 mr-2" />}
            ELIMINAR PERMANENTEMENTE
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
