'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteMessage } from '@/app/actions/contact';
import { toast } from 'sonner';

export default function DeleteMessageButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return;

    setIsDeleting(true);
    try {
      const result = await deleteMessage(id);
      if (result.success) {
        toast.success('Mensaje eliminado');
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error de red al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar mensaje"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
