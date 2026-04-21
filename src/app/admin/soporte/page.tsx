import { createClient } from '@/lib/supabase/server';
import { LifeBuoy, Clock, Search, Filter } from 'lucide-react';
import TicketReply from './TicketReply';
import { redirect } from 'next/navigation';

export default async function AdminSupportPage() {
  const supabase = await createClient();

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfiles } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user?.id)
    .single();

  if (perfiles?.rol !== 'superadmin') {
    redirect('/dashboard');
  }

  // Traer todos los tickets con el perfil del usuario (nombre/email)
  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*, perfiles(nombre_completo, email)')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-500 uppercase font-mono text-xs tracking-widest">Error cargando incidencias</p>
      </div>
    );
  }

  const openTickets = tickets?.filter(t => t.status !== 'cerrado').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-heading text-white uppercase tracking-tighter flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-primary" />
            Centro de Soporte Técnico
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mt-1">Gestión de incidencias de usuarios y hosts</p>
        </div>
        
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col justify-center items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest mb-1">Pendientes</span>
            <span className="text-xl font-heading text-primary leading-none">{openTickets}</span>
          </div>
          <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col justify-center items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest mb-1">Total Histórico</span>
            <span className="text-xl font-heading text-white leading-none">{tickets?.length || 0}</span>
          </div>
        </div>
      </header>

      {/* Controles simples de filtrado UI */}
      <div className="flex gap-4 mb-2">
         <div className="flex relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar ticket..." 
              className="w-full bg-background border border-border pl-10 pr-3 py-2 text-xs font-mono uppercase focus-visible:outline-none focus-visible:border-primary"
            />
         </div>
      </div>

      <div className="responsive-table-container cyber-card shadow-2xl overflow-hidden bg-card border-border">
        {tickets && tickets.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="cyber-table-header w-[25%] text-foreground">Usuario</th>
                <th className="cyber-table-header text-foreground">Asunto / Categoría</th>
                <th className="cyber-table-header text-foreground whitespace-nowrap">Prioridad</th>
                <th className="cyber-table-header text-foreground">Estado</th>
                <th className="cyber-table-header text-right text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map((ticket: any) => (
                <tr key={ticket.id} className="cyber-table-row group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-foreground text-xs uppercase truncate max-w-[200px]">
                      {ticket.perfiles?.nombre_completo || 'Usuario Desconocido'}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px]">
                      {ticket.perfiles?.email || 'Sin email'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-heading uppercase text-foreground mb-1">{ticket.subject}</p>
                    <p className="text-[10px] text-primary uppercase font-mono border border-primary/20 bg-primary/5 inline-block px-2 py-0.5 rounded">
                      {ticket.category}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[9px] text-zinc-500 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 tracking-tighter rounded-sm ${
                      ticket.priority === 'alta' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      ticket.priority === 'media' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded border text-[9px] font-bold uppercase tracking-tighter ${
                      ticket.status === 'abierto' ? 'bg-primary/10 text-primary border-primary/20' :
                      ticket.status === 'en_progreso' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <TicketReply ticket={ticket} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <LifeBuoy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">No hay incidencias registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
