'use client'

import { useState } from 'react'
import { cancelPlan } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { CreditCard, XCircle, ArrowRight, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PlanManagerProps {
    planName: string | null;
    isSubscribed: boolean;
}

export function PlanManager({ planName, isSubscribed }: PlanManagerProps) {
    const [isCancelling, setIsCancelling] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const currentPlan = planName || 'Sin Plan Activo'

    const handleCancel = async () => {
        setIsCancelling(true)
        setMessage(null)

        const result = await cancelPlan()

        if (result.success) {
            setMessage({ text: 'Plan cancelado exitosamente.', type: 'success' })
            setShowConfirm(false)
        } else {
            setMessage({ text: result.error || 'Error al cancelar el plan.', type: 'error' })
        }
        setIsCancelling(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Plan Actual</p>
                        <p className="text-lg font-heading font-black text-white uppercase">{currentPlan}</p>
                    </div>
                </div>
                {!isSubscribed && planName && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20 uppercase">
                        Cancelado / Expirado
                    </span>
                )}
                {isSubscribed && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 uppercase">
                        Activo
                    </span>
                )}
            </div>

            {message && (
                <div className={`p-4 text-sm font-medium rounded-lg flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{message.text}</p>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/dashboard/planes" className="flex-1">
                    <Button className="w-full gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90">
                        Cambiar o Renovar Plan
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
                
                {isSubscribed && !showConfirm && (
                    <Button 
                        variant="outline" 
                        className="flex-1 gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => setShowConfirm(true)}
                    >
                        <XCircle className="w-4 h-4" />
                        Cancelar Plan
                    </Button>
                )}

                {showConfirm && (
                    <div className="flex-1 flex gap-2">
                        <Button 
                            variant="destructive" 
                            className="flex-1 gap-2"
                            onClick={handleCancel}
                            disabled={isCancelling}
                        >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="flex-1"
                            onClick={() => setShowConfirm(false)}
                            disabled={isCancelling}
                        >
                            Volver
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
