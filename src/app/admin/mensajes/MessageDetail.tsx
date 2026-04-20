'use client';

import { useState } from 'react';
import { replyToMessage } from '@/app/actions/contact';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, Send, Mail, User, Calendar, MessageCircle } from 'lucide-react';
import DeleteMessageButton from './DeleteMessageButton';

export default function MessageDetail({ message }: { message: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Escribe una respuesta primero');
      return;
    }

    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append('messageId', message.id);
      formData.append('email', message.email);
      formData.append('reply', replyText);
      formData.append('originalMessage', message.message);

      const result = await replyToMessage(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Respuesta enviada correctamente vía Email');
        setIsOpen(false);
        setReplyText('');
      }
    } catch (error) {
      toast.error('Error al enviar la respuesta');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 text-[10px] uppercase font-black tracking-widest border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white">
            <Eye className="w-3 h-3 mr-2" />
            Ver y Responder
          </Button>
        }
      />
      
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 border-2 shadow-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 bg-black border-b border-zinc-900">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-heading text-white uppercase tracking-tighter">
              Detalle del Mensaje
            </DialogTitle>
            <div className="flex items-center gap-3">
               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter ${
                 message.status === 'unread' ? 'bg-primary text-black' : 
                 message.status === 'read' ? 'bg-zinc-800 text-zinc-400' : 
                 'bg-green-500 text-black'
               }`}>
                 {message.status === 'unread' ? 'No Leído' : message.status === 'read' ? 'Leído' : 'Respondido'}
               </span>
               <DeleteMessageButton id={message.id} />
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 overflow-x-hidden">
          {/* User Info List - Optimized to prevent overlap */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-900 pb-6">
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.2em] flex items-center gap-1.5 mb-1">
                  <User className="w-3 h-3 text-primary" /> Remitente
                </Label>
                <p className="text-base text-white font-heading uppercase truncate">{message.name}</p>
              </div>
              
              <div className="space-y-1.5 flex-1 min-w-0 md:text-right">
                <Label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.2em] flex items-center gap-1.5 md:justify-end mb-1">
                  <Mail className="w-3 h-3 text-primary" /> Dirección de Email
                </Label>
                <p className="text-sm text-zinc-300 font-mono break-all">{message.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.2em] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3 h-3 text-primary" /> Fecha de Recepción
              </Label>
              <p className="text-xs text-zinc-400 font-mono uppercase">
                {new Date(message.created_at).toLocaleDateString()} — {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] uppercase text-zinc-500 font-black tracking-[0.2em] flex items-center gap-1.5 mb-1">
              <MessageCircle className="w-3 h-3 text-primary" /> Mensaje Original
            </Label>
            <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
              <p className="text-sm text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Previous Admin Reply if exists */}
          {message.admin_reply && (
            <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-[1px] flex-1 bg-green-500/20" />
                <Label className="text-[9px] uppercase text-green-500 font-black tracking-[0.2em] whitespace-nowrap">Respuesta Enviada</Label>
                <div className="h-[1px] flex-1 bg-green-500/20" />
              </div>
              <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-2xl border-dashed">
                <p className="text-sm text-green-200/60 font-sans italic leading-relaxed">
                  "{message.admin_reply}"
                </p>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {message.status !== 'replied' && (
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <Label className="text-[9px] uppercase text-primary font-black tracking-[0.2em]">Escribir respuesta oficial</Label>
              <Textarea 
                placeholder={`Hola ${message.name.split(' ')[0]}, gracias por contactar con Lumina...`} 
                className="bg-black border-zinc-800 min-h-[140px] focus:ring-1 focus:ring-primary focus:border-primary rounded-2xl text-zinc-100 placeholder:text-zinc-700 p-6 transition-all duration-300"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-black border-t border-zinc-900">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white uppercase font-bold text-[10px]">
            Cerrar
          </Button>
          {message.status !== 'replied' && (
            <Button 
              className="cyber-button-cyan py-6 h-auto text-[11px] font-black tracking-widest"
              onClick={handleReply}
              disabled={isPending}
            >
              {isPending ? 'ENVIANDO...' : 'ENVIAR RESPUESTA POR EMAIL'}
              <Send className="w-3 h-3 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
