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
      const result = await replyToMessage(
        message.id, 
        replyText, 
        message.email, 
        message.subject
      );

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
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-[10px] uppercase font-black tracking-widest border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white">
          <Eye className="w-3 h-3 mr-2" />
          Ver y Responder
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-900 border-2 shadow-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 bg-black border-b border-zinc-900">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-heading text-white uppercase tracking-tighter">
              Detalle del Mensaje
            </DialogTitle>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter ${
              message.status === 'unread' ? 'bg-primary text-black' : 
              message.status === 'read' ? 'bg-zinc-800 text-zinc-400' : 
              'bg-green-500 text-black'
            }`}>
              {message.status === 'unread' ? 'No Leído' : message.status === 'read' ? 'Leído' : 'Respondido'}
            </span>
          </div>
        </DialogHeader>

        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* User Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1">
                <User className="w-3 h-3" /> Remitente
              </Label>
              <p className="text-sm text-white font-medium">{message.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <p className="text-sm text-zinc-300 font-mono">{message.email}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha de Recepción
              </Label>
              <p className="text-sm text-zinc-400">{new Date(message.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> Mensaje Original
            </Label>
            <div className="p-5 bg-zinc-900/50 border border-zinc-900 rounded-xl">
              <p className="text-sm text-zinc-300 leading-relaxed font-sans">{message.message}</p>
            </div>
          </div>

          {/* Previous Admin Reply if exists */}
          {message.admin_reply && (
            <div className="space-y-2 pt-4 border-t border-zinc-900">
              <Label className="text-[10px] uppercase text-green-500 font-bold tracking-widest">Respuesta Enviada</Label>
              <div className="p-5 bg-green-500/5 border border-green-500/10 rounded-xl">
                <p className="text-sm text-green-300/70 font-sans italic">{message.admin_reply}</p>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {message.status !== 'replied' && (
            <div className="space-y-3 pt-6 border-t border-zinc-900">
              <Label className="text-[10px] uppercase text-primary font-bold tracking-widest">Escribir Respuesta</Label>
              <Textarea 
                placeholder={`Hola ${message.name.split(' ')[0]}, gracias por contactar...`} 
                className="bg-black border-zinc-800 min-h-[120px] focus:border-primary rounded-xl text-zinc-100 placeholder:text-zinc-700"
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
