'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deletePantalla } from './actions'
import { toast } from 'sonner'
import { Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function PantallasTable({ initialData }: { initialData: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta pantalla? Las analíticas antiguas seguirán existiendo referenciando su ID.')) return;
    
    setLoading(id)
    const res = await deletePantalla(id)
    if (res.success) {
      toast.success('Pantalla eliminada')
    } else {
      toast.error('Error al eliminar')
    }
    setLoading(null)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left text-zinc-300">
        <thead className="text-xs text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Nombre y Ciudad</th>
            <th className="px-6 py-4">Coordenadas</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {initialData.length === 0 && (
            <tr><td colSpan={4} className="p-6 text-center text-zinc-500">No hay pantallas registradas. Usa el botón de Nueva Pantalla.</td></tr>
          )}
          {initialData.map(p => (
            <tr key={p.id} className="hover:bg-zinc-800/50">
              <td className="px-6 py-4 font-mono text-zinc-500">{p.id.slice(0, 8)}...</td>
              <td className="px-6 py-4">
                <p className="font-bold text-zinc-100">{p.nombre}</p>
                <p className="text-zinc-500">{p.ubicacion} ({p.ciudad})</p>
              </td>
              <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                {p.latitud ? `${p.latitud}, ${p.longitud}` : 'No Asignadas'}
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <Link href={`/player/${p.id}`} target="_blank">
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-zinc-400 hover:text-[#D4AF37] hover:bg-zinc-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    disabled={loading === p.id}
                    onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
