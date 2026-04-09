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
    const file = formData.get('video') as File

    const pantallaIds = pantallaIdsRaw ? pantallaIdsRaw.split(',') : [pantallaId]

    if (!nombreCampana || !fechaInicio || !fechaFin || (pantallaIds.length === 0 && !pantallaId) || !file || file.size === 0) {
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

    // 1. Upload File (Upload only once)
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('creatividades')
      .upload(fileName, file)

    if (uploadError) {
      console.error("Storage upload error: ", uploadError)
      return { type: 'error', message: 'Error al subir el archivo: ' + uploadError.message }
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('creatividades')
      .getPublicUrl(uploadData.path)

    // 3. IA SCAN (Brain integration)
    const iaResult = await analyzeVideo(publicUrl)
    let finalEstado = 'pendiente_aprobacion'
    
    if (iaResult.status === 'safe') {
      finalEstado = 'pre_aprobada'
    } else if (iaResult.status === 'flagged') {
      finalEstado = 'revision_manual_ia'
    } else if (iaResult.status === 'rejected') {
      finalEstado = 'rechazada_ia'
    }

    // 4. Insert into Database (Loop over IDs)
    const inserts = pantallaIds.map(id => ({
      cliente_id: user.id,
      pantalla_id: id !== "default" ? id : null,
      nombre_campana: nombreCampana,
      url_video: publicUrl,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      estado: finalEstado,
      ia_metadata: iaResult
    }))

    const { error: insertError } = await supabase
      .from('campanas')
      .insert(inserts)

    if (insertError) {
      console.error("DB insert error: ", insertError)
      return { type: 'error', message: 'Error al guardar en la base de datos.' }
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
