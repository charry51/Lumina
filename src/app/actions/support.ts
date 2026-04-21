'use server';

import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import { revalidatePath } from 'next/cache';

export async function createSupportTicket(formData: FormData) {
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;
  const category = formData.get('category') as string;
  const priority = formData.get('priority') as string;
  const attachment = formData.get('attachment') as File | null;

  if (!subject || !message || !category || !priority) {
    return { error: 'Todos los campos obligatorios deben estar llenos.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Debes iniciar sesión para crear un ticket.' };
    }

    let attachment_url = null;

    // Subir adjunto si existe
    if (attachment && attachment.size > 0) {
      const fileExt = attachment.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('support_attachments')
        .upload(fileName, attachment, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error subiendo archivo:', uploadError);
        return { error: 'Error al subir el archivo adjunto.' };
      }

      const { data: publicUrlData } = supabase.storage
        .from('support_attachments')
        .getPublicUrl(fileName);

      attachment_url = publicUrlData.publicUrl;
    }

    // Insertar el ticket en la DB
    const { error: dbError } = await supabase
      .from('support_tickets')
      .insert([
        { 
          user_id: user.id,
          subject,
          message,
          category,
          priority,
          status: 'abierto',
          attachment_url
        }
      ]);

    if (dbError) throw dbError;

    revalidatePath('/dashboard/soporte');
    return { success: true };
  } catch (error: any) {
    console.error('Error in createSupportTicket:', error);
    return { error: 'Hubo un error al enviar tu incidencia. Inténtalo de nuevo.' };
  }
}

export async function updateTicketStatus(ticketId: string, newStatus: string, adminReply: string | null = null, notifyUser: boolean = true) {
  if (!ticketId || !newStatus) {
    return { error: 'Datos insuficientes para actualizar el ticket.' };
  }

  try {
    const supabase = await createClient();

    // Actualizar en DB
    const updatePayload: any = { status: newStatus };
    if (adminReply) {
      updatePayload.admin_reply = adminReply;
    }

    const { error: dbError } = await supabase
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', ticketId);

    if (dbError) throw dbError;

    // Notificar al usuario (si hay respuesta o el estado cambia, según lo pedido por el usuario)
    if (notifyUser) {
      // Obtener el email del usuario para la notificación
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('subject, perfiles(email)')
        .eq('id', ticketId)
        .single();
      
      const userEmail = ticketData?.perfiles?.email;

      if (userEmail) {
        await resend.emails.send({
          from: 'Lumina Support <onboarding@resend.dev>',
          to: [userEmail],
          subject: `Actualización en tu ticket: ${ticketData.subject}`,
          html: `
            <div style="font-family: sans-serif; background: #ffffff; color: #000000; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #00d2ff; text-transform: uppercase;">Estado de tu Ticket Actualizado</h2>
              <p>Tu ticket "<strong>${ticketData.subject}</strong>" ha cambiado de estado a: <strong>${newStatus}</strong>.</p>
              ${adminReply ? `
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <h3>Respuesta del Equipo Técnico:</h3>
              <p style="white-space: pre-wrap; background: #f8f9fa; padding: 15px; border-radius: 8px;">${adminReply}</p>
              ` : ''}
              <br/>
              <p style="font-size: 12px; color: #64748b;">Puedes ver todos los detalles en tu panel de control de Lumina.</p>
            </div>
          `
        });
      }
    }

    revalidatePath('/admin/soporte');
    revalidatePath('/dashboard/soporte');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateTicketStatus:', error);
    return { error: 'No se pudo actualizar el ticket o enviar la notificación.' };
  }
}
