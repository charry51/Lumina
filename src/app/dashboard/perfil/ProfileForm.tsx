'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'

interface ProfileFormProps {
    initialData: {
        nombre: string;
        nombre_empresa: string;
        nif: string;
        telefono: string;
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [formData, setFormData] = useState(initialData)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const result = await updateProfile(formData)

        if (result.success) {
            setMessage({ text: 'Perfil actualizado con éxito', type: 'success' })
        } else {
            setMessage({ text: result.error || 'Error al actualizar el perfil', type: 'error' })
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500">Nombre Completo</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre || ''}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        placeholder="Tu nombre"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500">Nombre de la Empresa</label>
                    <input
                        type="text"
                        name="nombre_empresa"
                        value={formData.nombre_empresa || ''}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        placeholder="Ej. Mi Empresa SL"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500">NIF / CIF</label>
                    <input
                        type="text"
                        name="nif"
                        value={formData.nif || ''}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        placeholder="B12345678"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500">Teléfono</label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono || ''}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        placeholder="+34 600 000 000"
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 text-xs font-medium rounded-md ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </Button>
            </div>
        </form>
    )
}
