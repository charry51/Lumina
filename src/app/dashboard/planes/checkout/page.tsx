'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updatePlan } from './actions'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan')
  const [loading, setLoading] = useState(false)

  if (!planId) {
    router.push('/dashboard/planes')
    return null
  }

  const handlePayment = async () => {
    setLoading(true)
    // Simulamos un retraso de pasarela de pago (Stripe)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result = await updatePlan(planId)
    
    if (result.success) {
      toast.success('¡Suscripción actualizada con éxito!')
      router.push('/dashboard')
    } else {
      toast.error('Error al procesar el pago: ' + result.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4 bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Resumen del pedido</p>
            <h2 className="text-2xl font-bold capitalize">{planId.replace('_', ' ')}</h2>
          </div>
          <CreditCard className="w-8 h-8 opacity-50" />
        </div>
        
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-center text-slate-600 border-b pb-4 border-slate-100">
            <span>Suscripción Mensual</span>
            <span className="font-bold text-slate-900">Calculando...</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Estás en un entorno de pruebas seguro. Al hacer clic en el botón, el sistema simulará una transacción exitosa y actualizará los límites de tu cuenta de forma inmediata.
            </p>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span>--</span>
             </div>
             <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total a pagar</span>
                <span className="text-blue-600 italic">Simulado</span>
             </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0 flex flex-col gap-4">
          <Button 
            className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : "Confirmar y Pagar"}
          </Button>
          <Button variant="ghost" className="text-slate-400 text-xs" onClick={() => router.back()}>
            Cancelar y volver
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
