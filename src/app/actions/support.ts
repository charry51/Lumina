'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export type TicketCategory = 'Hardware / Pantalla' | 'Facturación / Pagos' | 'Contenido / Campañas' | 'Reportar Error' | 'Otros'
export type TicketStatus = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO'
export type TicketPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE'

/**
 * Creates a new support ticket and the initial message.
 */
export async function createSupportTicket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const asunto = formData.get('asunto') as string
  const categoria = formData.get('categoria') as TicketCategory
  const prioridad = (formData.get('prioridad') as TicketPriority) || 'MEDIA'
  const mensajeInitial = formData.get('mensaje') as string
  const archivoUrl = formData.get('archivo_url') as string // Handle from client upload

  try {
    // 1. Insertar el Ticket
    const { data: ticket, error: ticketErr } = await supabase
      .from('soporte_tickets')
      .insert({
        user_id: user.id,
        asunto,
        categoria,
        prioridad,
        estado: 'PENDIENTE'
      })
      .select()
      .single()

    if (ticketErr) throw ticketErr

    // 2. Insertar el Mensaje Inicial
    const { error: msgErr } = await supabase
      .from('soporte_mensajes')
      .insert({
        ticket_id: ticket.id,
        remitente_id: user.id,
        mensaje: mensajeInitial,
        archivo_url: archivoUrl || null,
        es_admin: false
      })

    if (msgErr) throw msgErr

    // 3. Notificar al Admin por email si está configurado
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      try {
        // Sandbox Mode Bypass
        const isSandbox = !process.env.RESEND_DOMAIN || process.env.RESEND_DOMAIN === 'onboarding@resend.dev';
        const toEmail = isSandbox ? (process.env.ADMIN_EMAIL || 'francharrielromero@gmail.com') : adminEmail;

        await resend.emails.send({
          from: `LUMINADDDD Support <${process.env.RESEND_DOMAIN || 'onboarding@resend.dev'}>`,
          to: toEmail,
          subject: `NEW TICKET: [${categoria}] ${asunto}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #00d2ff;">Nuevo Ticket de Soporte (LUMINADDDD)</h2>
              <p><strong>Usuario ID:</strong> ${user.id}</p>
              <p><strong>Categoría:</strong> ${categoria}</p>
              <p><strong>Prioridad:</strong> ${prioridad}</p>
              <p><strong>Asunto:</strong> ${asunto}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Mensaje:</strong></p>
              <p style="white-space: pre-wrap;">${mensajeInitial}</p>
              <br />
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/soporte/${ticket.id}" style="background: #00d2ff; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Responder en Panel Admin</a>
            </div>
          `
        })
      } catch (err) {
        console.error('Error sending admin notification:', err)
      }
    }

    revalidatePath('/dashboard/soporte')
    revalidatePath('/admin/soporte')
    return { success: true, ticketId: ticket.id }
  } catch (error: any) {
    console.error('Error in createSupportTicket:', error)
    return { error: error.message }
  }
}

/**
 * Adds a reply to an existing ticket. 
 * Sends an email notification if it's an admin reply.
 */
export async function replyToSupportTicket(
  ticketId: string, 
  mensaje: string, 
  archivoUrl?: string | null,
  esAdmin: boolean = false
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  try {
    // 1. Insertar el Mensaje
    const { error: msgErr } = await supabase
      .from('soporte_mensajes')
      .insert({
        ticket_id: ticketId,
        remitente_id: user.id,
        mensaje,
        archivo_url: archivoUrl || null,
        es_admin: esAdmin
      })

    if (msgErr) throw msgErr

    // 2. Si es admin, actualizar estado a EN_PROCESO y notificar por email al usuario
    if (esAdmin) {
      await supabase
        .from('soporte_tickets')
        .update({ estado: 'EN_PROCESO', updated_at: new Date().toISOString() })
        .eq('id', ticketId)

      // Notificar al usuario (host)
      const { data: ticket } = await supabase
        .from('soporte_tickets')
        .select('*, perfiles:user_id(email, nombre_empresa)')
        .eq('id', ticketId)
        .single()

      if (ticket?.perfiles?.email) {
        // Sandbox Mode Bypass
        const isSandbox = !process.env.RESEND_DOMAIN || process.env.RESEND_DOMAIN === 'onboarding@resend.dev';
        const toEmail = isSandbox ? (process.env.ADMIN_EMAIL || 'francharrielromero@gmail.com') : ticket.perfiles.email;

        await resend.emails.send({
          from: `LUMINADDDD Support <${process.env.RESEND_DOMAIN || 'onboarding@resend.dev'}>`,
          to: toEmail,
          replyTo: 'soporte@LUMINADDDD.com',
          subject: `Re: [Soporte #${ticketId.slice(0, 5)}] ${ticket.asunto}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #00d2ff;">Nueva respuesta de LUMINADDDD</h2>
              <p>Hola ${ticket.perfiles.nombre_empresa || 'Cliente'},</p>
              <p>Nuestro equipo técnico ha respondido a tu consulta:</p>
              <blockquote style="border-left: 4px solid #00d2ff; padding-left: 15px; margin: 20px 0; font-style: italic;">
                ${mensaje}
              </blockquote>
              <p>Puedes ver toda la conversación y responder desde tu panel:</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/dashboard/soporte/${ticketId}" style="background: #00d2ff; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Ir al Ticket</a>
            </div>
          `
        })
      }
    } else {
        // Si responde el usuario, volver a marcar como PENDIENTE para el admin y notificarle
        await supabase
        .from('soporte_tickets')
        .update({ estado: 'PENDIENTE', updated_at: new Date().toISOString() })
        .eq('id', ticketId)

        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          try {
            // Sandbox Mode Bypass
            const isSandbox = !process.env.RESEND_DOMAIN || process.env.RESEND_DOMAIN === 'onboarding@resend.dev';
            const toEmail = isSandbox ? (process.env.ADMIN_EMAIL || 'francharrielromero@gmail.com') : adminEmail;

            await resend.emails.send({
              from: `LUMINADDDD Support <${process.env.RESEND_DOMAIN || 'onboarding@resend.dev'}>`,
              to: toEmail,
              subject: `REPLY: Support #${ticketId.slice(0, 5)}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                   <h2 style="color: #00d2ff;">El usuario ha respondido en LUMINADDDD</h2>
                   <p><strong>Ticket ID:</strong> ${ticketId}</p>
                   <p><strong>Mensaje:</strong></p>
                   <p style="white-space: pre-wrap;">${mensaje}</p>
                   <br />
                   <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/soporte/${ticketId}" style="background: #00d2ff; color: black; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">Ir a Consultas</a>
                </div>
              `
            })
          } catch (err) {
            console.error('Error notifying admin of user reply:', err)
          }
        }
    }

    revalidatePath(`/dashboard/soporte/${ticketId}`)
    revalidatePath(`/admin/soporte/${ticketId}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error in replyToSupportTicket:', error)
    return { error: error.message }
  }
}

/**
 * Changes ticket status (Admin only)
 */
export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('soporte_tickets')
        .update({ estado: status, updated_at: new Date().toISOString() })
        .eq('id', ticketId)

    if (error) return { error: error.message }
    revalidatePath('/admin/soporte')
    revalidatePath(`/dashboard/soporte/${ticketId}`)
    return { success: true }
}

/**
 * AI Engine: Analyzes ticket description to suggest category and priority.
 * Uses a heuristic approach (keyword and context analysis).
 */
export async function analyzeTicketMessage(text: string): Promise<{ categoria: TicketCategory, prioridad: TicketPriority }> {
  const content = text.toLowerCase();
  
  let categoria: TicketCategory = 'Otros';
  let prioridad: TicketPriority = 'MEDIA';

  // 1. Categoria Logic
  if (content.match(/(tv|pantalla|monitor|cable|hdmi|conexion|apagada|hardware|físico|roto|quemado|enciende)/i)) {
    categoria = 'Hardware / Pantalla';
  } else if (content.match(/(pago|cobro|factura|dinero|tarjeta|precio|coste|suscripción|plan|reembolso|cobrado|cargo)/i)) {
    categoria = 'Facturación / Pagos';
  } else if (content.match(/(campaña|anuncio|creatividad|video|reproducir|reproduccion|contenido|imagen|media|cartel)/i)) {
    categoria = 'Contenido / Campañas';
  } else if (content.match(/(error|bug|fallo|no funciona|crash|app|aplicacion|sistema|lento|caido|login|entrar)/i)) {
    categoria = 'Reportar Error';
  }

  // 2. Prioridad Logic
  if (content.match(/(urgente|critico|inmediato|roto|no emite|negro|dinero|caído|perdida|estafa|legal|denuncia|grave|emergencia)/i)) {
    prioridad = 'URGENTE';
  } else if (content.match(/(ayuda|mal|problema|error|falla|bloqueado|importante)/i)) {
    prioridad = 'ALTA';
  } else if (content.match(/(duda|pregunta|info|gracias|consulta|saber|como)/i)) {
    prioridad = 'BAJA';
  }

  // Simulated AI Latency for premium feel
  await new Promise(r => setTimeout(r, 600));

  return { categoria, prioridad };
}

/**
 * Deletes a support ticket and all its messages (Admin only)
 */
export async function deleteSupportTicket(ticketId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    // Verificar si es superadmin
    const { data: profile } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (profile?.rol !== 'superadmin') {
        return { error: 'No tienes permisos para realizar esta acción' }
    }

    // El borrado en cascada debería encargarse de soporte_mensajes si está configurado en DB
    // Pero por seguridad lo hacemos explícito o confiamos en cascada.
    const adminSupabase = await createAdminClient()
    const { error } = await adminSupabase
        .from('soporte_tickets')
        .delete()
        .eq('id', ticketId)

    if (error) return { error: error.message }

    revalidatePath('/admin/soporte')
    revalidatePath('/dashboard/soporte')
    return { success: true }
}
