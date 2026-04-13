'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import crypto from 'node:crypto'
import { analyzeVideo } from '@/lib/ia/validator'

export async function createCampaign(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { type: 'error', message: 'No estás autenticado.' }
    }

    const nombreCampana = formData.get('nombre_campana') as string
    const fechaInicio = formData.get('fecha_inicio') as string
    const fechaFin = formData.get('fecha_fin') as string
    const publicUrl = formData.get('video_url') as string // URL ya subida desde el cliente
    
    // Dayparting Logic: Only 'expansion' or 'dominio' can custom times
    let horaInicio = (formData.get('hora_inicio') as string) || '00:00:00'
    let horaFin = (formData.get('hora_fin') as string) || '23:59:59'
    
    // Obtener plan para restricción (necesario antes de procesar)
    const { data: profile } = await supabase
      .from('perfiles')
      .select('*, planes(*)')
      .eq('id', user.id)
      .single()

    const planId = profile?.planes?.id || 'presencia'
    const canDaypart = planId === 'expansion' || planId === 'dominio'

    if (!canDaypart) {
      horaInicio = '00:00:00'
      horaFin = '23:59:59'
    }
    const pantallaId = formData.get('pantalla_id') as string
    const pantallaIdsRaw = formData.get('pantalla_ids') as string // Nuevo campo opcional para múltiple selección

    const pantallaIds = pantallaIdsRaw ? pantallaIdsRaw.split(',') : [pantallaId]

    if (!nombreCampana || !fechaInicio || !fechaFin || (pantallaIds.length === 0 && !pantallaId) || !publicUrl) {
      return { type: 'error', message: 'Por favor, completa todos los campos requeridos.' }
    }

    const { count: existingCount } = await supabase
      .from('campanas')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', user.id)

    const maxCampanas = profile?.planes?.max_campanas || 1
    const totalNew = pantallaIds.length
    
    if (((existingCount || 0) + totalNew) > maxCampanas) {
      return { 
        type: 'error', 
        message: `Has alcanzado el límite de tu plan (${maxCampanas} campañas máximo). Solo puedes añadir ${maxCampanas - (existingCount || 0)} más.` 
      }
    }

    // 3. IA SCAN (Brain integration) - Ahora lo hace sobre la URL recibida
    const iaResult = await analyzeVideo(publicUrl)
    let finalEstado = 'pendiente_aprobacion'
    
    if (iaResult.status === 'safe') {
      finalEstado = 'pre_aprobada'
    } else if (iaResult.status === 'flagged') {
      finalEstado = 'revision_manual_ia'
    } else if (iaResult.status === 'rejected') {
      finalEstado = 'rechazada_ia'
    }

    // 4. Obtener datos de las pantallas (para precio y organización)
    const { data: screensData } = await supabase
      .from('pantallas')
      .select('id, precio_emision, organizacion_id')
      .in('id', pantallaIds)

    const screensMap = new Map(screensData?.map(s => [s.id, s]) || [])

    // 5. Insert into Database (Loop over IDs)
    const inserts = pantallaIds.map(id => {
      const screen = screensMap.get(id)
      return {
        cliente_id: user.id,
        pantalla_id: id !== "default" ? id : null,
        organizacion_id: profile?.organizacion_id, // Obligatorio para RLS
        nombre_campana: nombreCampana,
        url_video: publicUrl,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: finalEstado,
        ia_metadata: iaResult,
        precio_pactado: screen?.precio_emision || 50.00 // Congelamos el precio actual
      }
    })

    const { error: insertError } = await supabase
      .from('campanas')
      .insert(inserts)

    if (insertError) {
      console.error("DB insert error: ", insertError)
      return { type: 'error', message: `Error de Base de Datos: ${insertError.message} (${insertError.code})` }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    
    let successMessage = `¡${totalNew} ${totalNew > 1 ? 'campañas creadas' : 'campaña creada'} con éxito!`
    if (iaResult.status === 'safe') successMessage += " (IA: Validada como segura ✅)"
    if (iaResult.status === 'flagged') successMessage += " (IA: Requiere revisión manual ⚠️)"
    
    return { type: 'success', message: successMessage }

  } catch (err: any) {
    console.error("Error en createCampaign:", err)
    return { type: 'error', message: err.message || 'Error inesperado.' }
  }
}
