import { createClient } from '@/lib/supabase/server'
import { NewTicketDialog } from './NewTicketDialog'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  LifeBuoy, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function SoportePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: tickets } = await supabase
    .from('soporte_tickets')
    .select('*, soporte_mensajes(count)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 sm:p-8 font-sans">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-900 pb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full border-zinc-800 bg-zinc-900/50 hover:bg-[#7C3CFF]/10 hover:border-[#7C3CFF]/30 h-10 w-10 text-zinc-400 hover:text-[#7C3CFF] transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#7C3CFF]/10 rounded-lg">
                <LifeBuoy className="w-6 h-6 text-[#7C3CFF]" />
              </div>
              <h1 className="text-3xl font-heading uppercase font-black italic text-transparent bg-clip-text bg-gradient-to-br from-[#7C3CFF] to-[#00a1ff] pr-4 pb-2">
                Soporte Técnico
              </h1>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono pl-1">
              Gestión de incidencias y consultas directas con el equipo LuminAdd
            </p>
          </div>
        </div>

        <NewTicketDialog />
      </header>

      <div className="grid grid-cols-1 gap-4">
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket: any) => (
            <Link 
              key={ticket.id} 
              href={`/dashboard/soporte/${ticket.id}`}
              className="group block"
            >
              <div className="cyber-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#7C3CFF]/50 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter ${
                      ticket.estado === 'PENDIENTE' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                      ticket.estado === 'EN_PROCESO' ? 'bg-[#7C3CFF]/20 text-[#7C3CFF] border border-[#7C3CFF]/30' :
                      ticket.estado === 'RESUELTO' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {ticket.estado.replace('_', ' ')}
                    </span>
                    <span className={`text-[9px] font-mono text-zinc-500 uppercase tracking-tighter`}>
                      ID: {ticket.id.slice(0, 8)}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">• {ticket.categoria}</span>
                  </div>

                  <h3 className="text-lg font-heading text-white uppercase group-hover:text-[#7C3CFF] transition-colors">
                    {ticket.asunto}
                  </h3>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase">
                      <MessageSquare className="w-3 h-3 text-[#7C3CFF]" />
                      {ticket.soporte_mensajes?.[0]?.count || 0} Mensajes
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest mb-1">Prioridad</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      ticket.prioridad === 'URGENTE' ? 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                      ticket.prioridad === 'ALTA' ? 'text-amber-500' :
                      'text-zinc-500'
                    }`}>
                      {ticket.prioridad}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-[#7C3CFF] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-32 text-center cyber-card border-dashed bg-zinc-900/20 border-zinc-800 opacity-60">
            <LifeBuoy className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <p className="text-zinc-500 uppercase tracking-[0.3em] text-xs font-bold font-heading">
              No tienes tickets de soporte activos
            </p>
            <p className="text-[10px] text-zinc-700 uppercase mt-2 font-mono">
              Pulsa el botón superior si necesitas ayuda técnica
            </p>
          </div>
        )}
      </div>

      <footer className="mt-12 pt-8 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 flex items-center gap-4">
            <Clock className="w-5 h-5 text-[#7C3CFF] opacity-50" />
            <div>
               <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Tiempo de respuesta</p>
               <p className="text-xs text-zinc-300 font-heading tracking-tight uppercase">Menos de 24 horas</p>
            </div>
         </div>
         <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-800 flex items-center gap-4">
            <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />
            <div>
               <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Estado del Sistema</p>
               <p className="text-xs text-zinc-300 font-heading tracking-tight uppercase text-green-400">Totalmente Operativo</p>
            </div>
         </div>
      </footer>
    </div>
  )
}



