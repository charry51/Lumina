import { createClient } from '@/lib/supabase/server';
import { 
  LifeBuoy, 
  MessageSquarePlus, 
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSupportTicket } from '@/app/actions/support';

export default async function UserSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tickets, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-foreground uppercase tracking-tighter flex items-center gap-3">
             <LifeBuoy className="w-8 h-8 text-primary" />
             Soporte Técnico
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mt-1">Centro de ayuda e incidencias</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Nuevo Ticket */}
        <div className="lg:col-span-1">
          <div className="cyber-card p-6 sticky top-6">
            <h2 className="text-xl font-heading uppercase text-foreground mb-4 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-primary" />
              Nuevo Ticket
            </h2>
            <form action={createSupportTicket} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Asunto</Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  placeholder="Ej: Problema con reproducción en pantalla" 
                  className="bg-background border-border font-mono text-xs rounded-none"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Categoría</Label>
                  <select 
                    id="category" 
                    name="category" 
                    className="flex h-10 w-full bg-background border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-none"
                    required
                  >
                    <option value="tecnico">Técnico/Pantalla</option>
                    <option value="facturacion">Facturación</option>
                    <option value="cuenta">Mi Cuenta</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Prioridad</Label>
                  <select 
                    id="priority" 
                    name="priority" 
                    className="flex h-10 w-full bg-background border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-none"
                    required
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta" className="text-red-500">Alta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Mensaje / Descripción</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  placeholder="Detalla tu incidencia para que podamos ayudarte mejor..." 
                  className="bg-background border-border font-mono text-xs rounded-none resize-none"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  Archivo Adjunto (Opcional)
                </Label>
                <Input 
                  id="attachment" 
                  name="attachment" 
                  type="file" 
                  accept="image/*,.pdf"
                  className="bg-background border-border font-mono text-xs rounded-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <button type="submit" className="cyber-button-cyan w-full text-xs py-3 mt-4">
                Enviar Incidencia
              </button>
            </form>
          </div>
        </div>

        {/* Historial de Tickets */}
        <div className="lg:col-span-2">
          <div className="cyber-card p-6 h-full flex flex-col">
            <h2 className="text-xl font-heading uppercase text-foreground mb-6">Mis Incidencias</h2>
            
            <div className="flex-1 overflow-auto pr-2">
              {(!tickets || tickets.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-12">
                  <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                  <p className="text-sm font-heading uppercase tracking-widest">No hay incidencias reportadas</p>
                  <p className="text-xs text-muted-foreground font-mono mt-2">Todo funciona correctamente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <div key={ticket.id} className="bg-background border border-border p-5 transition-all hover:border-primary/50 text-left w-full group flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2 items-center">
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 tracking-tighter ${
                            ticket.status === 'abierto' ? 'bg-primary/10 text-primary border-primary/20' :
                            ticket.status === 'en_progreso' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-green-500/10 text-green-500 border-green-500/20'
                          } border`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 tracking-tighter bg-zinc-800 text-zinc-300 border border-zinc-700`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-heading uppercase text-foreground mb-2">{ticket.subject}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 break-words">
                        {ticket.message}
                      </p>

                      {ticket.admin_reply && (
                        <div className="mt-auto pt-3 border-t border-border/50 bg-primary/5 p-3 rounded-md">
                          <p className="text-[10px] font-mono uppercase text-primary mb-1 tracking-widest font-bold">Respuesta del Soporte:</p>
                          <p className="text-xs text-foreground italic">"{ticket.admin_reply}"</p>
                        </div>
                      )}
                      
                      {ticket.attachment_url && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                           <a href={ticket.attachment_url} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              Ver adjunto
                           </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
