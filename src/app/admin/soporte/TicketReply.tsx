'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateTicketStatus } from '@/app/actions/support';
import { MessageSquareReply, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketReply({ ticket }: { ticket: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [replyText, setReplyText] = useState(ticket.admin_reply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Si metemos texto, por defecto notificamos al usuario
    const notifyUser = replyText.length > 0;
    
    const result = await updateTicketStatus(ticket.id, status, replyText, notifyUser);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Ticket actualizado y notificado correctamente.');
      setIsOpen(false);
    }
    
    setIsSubmitting(false);
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="cyber-button-cyan hover:text-black hover:bg-primary font-mono text-[10px] tracking-widest uppercase px-4 h-8"
      >
        <MessageSquareReply className="w-3 h-3 mr-2" />
        Gestionar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="cyber-card w-full max-w-xl bg-card border border-primary/30 p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-heading uppercase text-foreground mb-4">Gestionar Incidencia</h2>
            
            <div className="bg-background/50 border border-border p-4 mb-6 rounded-md">
                <div className="flex justify-between mb-2">
                   <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Asunto: <span className="text-white font-bold">{ticket.subject}</span></p>
                   <p className="text-[10px] font-mono text-zinc-500 uppercase">Prioridad: <span className="text-white">{ticket.priority}</span></p>
                </div>
                <p className="text-xs text-zinc-400 border-l-2 border-primary/30 pl-3 py-1 italic mb-3">
                   "{ticket.message}"
                </p>
                {ticket.attachment_url && (
                    <a href={ticket.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] uppercase font-mono text-primary hover:text-white transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Ver Archivo Adjunto
                    </a>
                )}
            </div>

            <form onSubmit={handleReply} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest block">Cambiar Estado</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-xs font-mono uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest block">Respuesta para el Usuario (Opcional)</label>
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-xs font-mono min-h-[100px] resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  placeholder="Instrucciones o resolución... (Esto enviará un email al usuario)"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="text-xs uppercase font-bold tracking-widest px-6"
                >
                  Cancelar
                </Button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="cyber-button-cyan text-xs uppercase font-bold tracking-widest px-6 py-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
