'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    const horaInicio = (formData.get('hora_inicio') as string) || '00:00:00'
    const horaFin = (formData.get('hora_fin') as string) || '23:59:59'
    const pantallaId = formData.get('pantalla_id') as string // Deberá haberse ejecutado el ALTER TABLE 
    const file = formData.get('video') as File

    if (!nombreCampana || !fechaInicio || !fechaFin || !pantallaId || !file || file.size === 0) {
      return { type: 'error', message: 'Por favor, completa todos los campos requeridos.' }
    }

    // 0. Verificar límites del plan
    const { data: profile } = await supabase
      .from('perfiles')
      .select('*, planes(*)')
      .eq('id', user.id)
      .single()

    const { data: existingCount } = await supabase
      .from('campanas')
      .select('id', { count: 'exact', head: true })
      .eq('cliente_id', user.id)

    const maxCampanas = profile?.planes?.max_campanas || 1
    if ((existingCount || 0) >= maxCampanas) {
      return { 
        type: 'error', 
        message: `Has alcanzado el límite de tu plan (${maxCampanas} campaña). Mejora tu plan para añadir más.` 
      }
    }

    // 1. Upload File
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

    // 3. Insert into Database
    const { error: insertError } = await supabase
      .from('campanas')
      .insert({
        cliente_id: user.id,
        pantalla_id: pantallaId !== "default" ? pantallaId : null,
        nombre_campana: nombreCampana,
        url_video: publicUrl,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: 'pendiente_aprobacion' // Por defecto siempre pendiente para que el admin lo vea
      })

    if (insertError) {
      console.error("DB insert error: ", insertError)
      return { type: 'error', message: 'Error al guardar en la base de datos.' }
    }

    revalidatePath('/dashboard')
    
    return { type: 'success', message: '¡Campaña subida con éxito!' }

  } catch (err: any) {
    return { type: 'error', message: err.message || 'Error inesperado.' }
  }
}
