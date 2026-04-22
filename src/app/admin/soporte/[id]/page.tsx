import { createAdminClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, User, ExternalLink, Calendar, Mail, Tag, AlertTriangle } from 'lucide-react'
import { SupportReplyForm } from '@/app/dashboard/soporte/SupportReplyForm'
import { StatusChangeSelect } from './StatusChangeSelect'
import { DeleteTicketButton } from './DeleteTicketButton'

export const dynamic = 'force-dynamic'

export default async function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createAdminClient()
  const { id } = await params

  // 1. Fetch Ticket with User data
  const { data: ticket, error: ticketErr } = await supabase
    .from('soporte_tickets')
    .select('*, perfiles:user_id(*)')
    .eq('id', id)
    .single()

  if (!ticket || ticketErr) notFound()

  // 2. Fetch Messages
  const { data: mensajes } = await supabase
    .from('soporte_mensajes')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Admin */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
        <div className="space-y-4">
           <Link href="/admin/soporte" className="flex items-center gap-2 text-zinc-500 hover:text-[#00d2ff] transition-colors text-[10px] uppercase font-black tracking-widest group">
                <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 
                Volver a la Cola
           </Link>
           <div>
             <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-heading text-white uppercase tracking-tighter italic font-black">
                   {ticket.asunto}
                </h1>
             </div>
             <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-widest mt-2">
                <div className="px-3 py-1 bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] rounded-full flex items-center gap-2">
                   <Tag className="w-3 h-3" /> {ticket.categoria}
                </div>
                <div className={`px-3 py-1 border rounded-full flex items-center gap-2 ${
                  ticket.prioridad === 'URGENTE' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                  ticket.prioridad === 'ALTA' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                  'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                   <AlertTriangle className="w-3 h-3 shrink-0" /> {ticket.prioridad}
                </div>
             </div>
           </div>
        </div>

        <div className="flex flex-col items-end gap-4">
           <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
               <p className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.2em] mb-1">Estado</p>
               <StatusChangeSelect ticketId={ticket.id} currentStatus={ticket.estado} />
             </div>
             <div className="pt-4">
               <DeleteTicketButton ticketId={ticket.id} />
             </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Chat Thread */}
        <div className="lg:col-span-3 space-y-8">
           <div className="space-y-6">
              {mensajes?.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.es_admin ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                     {msg.es_admin ? (
                       <>
                        <span className="text-[9px] text-[#00d2ff] font-black uppercase tracking-widest text-right">Administración</span>
                        <ShieldCheck className="w-3 h-3 text-[#00d2ff]" />
                       </>
                     ) : (
                       <>
                        <User className="w-3 h-3 text-zinc-600" />
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Host / Usuario</span>
                       </>
                     )}
                  </div>

                  <div className={`cyber-card max-w-[90%] md:max-w-[80%] p-5 ${
                    msg.es_admin 
                      ? 'bg-[#00d2ff]/5 border-[#00d2ff]/20' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
                      {msg.mensaje}
                    </p>
                    
                    {msg.archivo_url && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-zinc-900 group relative">
                        <img src={msg.archivo_url} alt="Adjunto" className="w-full h-auto object-cover max-h-[400px]" />
                        <a 
                          href={msg.archivo_url} 
                          target="_blank" 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                        >
                           <ExternalLink className="w-5 h-5 text-[#00d2ff]" />
                           <span className="text-[10px] text-white font-black uppercase tracking-widest text-shadow">Descargar Adjunto</span>
                        </a>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[8px] text-zinc-600 uppercase font-mono italic">
                       <span>{new Date(msg.created_at).toLocaleDateString()} • {new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           {/* Reply Box Admin */}
           <div className="pt-8 border-t border-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-[#00d2ff] opacity-80" />
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#00d2ff]">Enviar Respuesta Oficial</h2>
              </div>
              <SupportReplyForm ticketId={ticket.id} esAdmin={true} />
              <p className="mt-3 text-[9px] text-zinc-600 uppercase italic font-mono">
                Se enviará una notificación automática por correo al usuario tras enviar esta respuesta.
              </p>
           </div>
        </div>

        {/* User Sidebar Info */}
        <div className="space-y-6">
           <div className="cyber-card p-6 bg-zinc-900/40">
              <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <User className="w-3 h-3" /> Datos del Cliente
              </h4>
              <div className="space-y-4">
                 <div>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Empresa / Nombre</p>
                    <p className="text-sm text-white font-heading truncate uppercase">{ticket.perfiles?.nombre_empresa || 'N/A'}</p>
                 </div>
                 <div>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Email Principal</p>
                    <div className="flex items-center gap-2">
                       <Mail className="w-3 h-3 text-[#00d2ff]" />
                       <p className="text-xs text-zinc-400 font-mono truncate">{ticket.perfiles?.email}</p>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-zinc-800">
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">ID Usuario</p>
                    <p className="text-[10px] text-zinc-500 font-mono italic truncate">{ticket.user_id}</p>
                 </div>
              </div>
           </div>

           <div className="cyber-card p-6 bg-zinc-900/40">
              <h4 className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Calendar className="w-3 h-3" /> Metadata Ticket
              </h4>
              <div className="space-y-4">
                 <div>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Creado el</p>
                    <p className="text-xs text-zinc-300 font-mono">{new Date(ticket.created_at).toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[9px] text-zinc-600 uppercase font-bold mb-1">Última actualización</p>
                    <p className="text-xs text-zinc-300 font-mono">{new Date(ticket.updated_at).toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5">
              <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle className="w-4 h-4 text-red-500" />
                 <span className="text-[9px] text-red-500 uppercase font-black tracking-widest">Protocolo de Emergencia</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">
                 Si detectas contenido fraudulento o sospechoso, reporta al administrador de red de inmediato.
              </p>
           </div>
        </div>

      </div>
    </div>
  )
}
