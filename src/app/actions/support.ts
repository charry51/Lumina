'use server'

import { createClient } from '@/lib/supabase/server'
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

    // 2. Si es admin, actualizar estado a EN_PROCESO y notificar por email
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
        await resend.emails.send({
          from: 'Lumina Support <soporte@lumina.com>',
          to: ticket.perfiles.email,
          replyTo: 'soporte@lumina.com',
          subject: `Re: [Soporte #${ticketId.slice(0, 5)}] ${ticket.asunto}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #00d2ff;">Nueva respuesta de Lumina</h2>
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
        // Si responde el usuario, volver a marcar como PENDIENTE para el admin
        await supabase
        .from('soporte_tickets')
        .update({ estado: 'PENDIENTE', updated_at: new Date().toISOString() })
        .eq('id', ticketId)
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
