'use client'

import { Button } from '@/components/ui/button'
import { authorizeCampaignStatus } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'

export function ActionButtons({ campanaId }: { campanaId: string }) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (status: 'aprobada' | 'rechazada') => {
    setLoading(true)
    const result = await authorizeCampaignStatus(campanaId, status)
    
    if (result.success) {
      toast.success(`Campaña ${status} correctamente`)
    } else {
      toast.error(result.error || 'Hubo un problema al procesar la acción')
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => handleAction('aprobada')}
        disabled={loading}
      >
        Aprobar
      </Button>
      <Button 
        size="sm" 
        variant="destructive"
        onClick={() => handleAction('rechazada')}
        disabled={loading}
      >
        Rechazar
      </Button>
    </div>
  )
}
