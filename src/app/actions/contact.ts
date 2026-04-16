'use server';

import { createClient } from '@/lib/supabase/server';
import { resend } from '@/lib/resend';
import { revalidatePath } from 'next/cache';

export async function sendContactMessage(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !subject || !message) {
    return { error: 'Todos los campos son obligatorios' };
  }

  try {
    const supabase = await createClient();

    // 1. Guardar en base de datos
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        { name, email, subject, message, status: 'unread' }
      ]);

    if (dbError) throw dbError;

    // 2. Enviar email de notificación al admin (y opcionalmente confirmación al usuario)
    // NOTA: Usamos onboarding@resend.dev por defecto si no hay dominio verificado
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Lumina <onboarding@resend.dev>',
      to: ['charry51@example.com'], // Cambiar por el email real del admin
      subject: `Nuevo mensaje de contacto: ${subject}`,
      html: `
        <div style="font-family: sans-serif; background: #0a0a0f; color: #f8f9fa; padding: 40px; border-radius: 12px;">
          <h1 style="color: #00d2ff; text-transform: uppercase; letter-spacing: 2px;">Nuevo Mensaje</h1>
          <p><strong>De:</strong> ${name} (${email})</p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #2a2a3d; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
          <br />
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/mensajes" 
             style="display: inline-block; background: #D4AF37; color: #0a0a0f; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
            Responder en el Panel
          </a>
        </div>
      `
    });

    if (emailError) {
      console.error('Error enviando email:', emailError);
      // No fallamos toda la acción si el email falla (ya que se guardó en DB), 
      // pero informamos al log.
    }

    revalidatePath('/admin/mensajes');
    return { success: true };
  } catch (error: any) {
    console.error('Error in sendContactMessage:', error);
    return { error: 'Hubo un error al enviar el mensaje. Inténtalo de nuevo.' };
  }
}

export async function replyToMessage(messageId: string, replyText: string, userEmail: string, originalSubject: string) {
  if (!messageId || !replyText || !userEmail) {
    return { error: 'Datos insuficientes para responder' };
  }

  try {
    const supabase = await createClient();

    // 1. Enviar el email vía Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Lumina Intelligence <onboarding@resend.dev>',
      to: [userEmail],
      subject: `RE: ${originalSubject} - Lumina`,
      html: `
        <div style="font-family: sans-serif; background: #ffffff; color: #000000; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0056e0;">Respuesta de Lumina</h2>
          <p style="white-space: pre-wrap; font-size: 16px; line-height: 1.6;">${replyText}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Gracias por contactar con Lumina Intelligence.</p>
        </div>
      `
    });

    if (emailError) throw emailError;

    // 2. Actualizar estado en DB
    const { error: dbError } = await supabase
      .from('contact_messages')
      .update({ 
        status: 'replied',
        admin_reply: replyText
      })
      .eq('id', messageId);

    if (dbError) throw dbError;

    revalidatePath('/admin/mensajes');
    return { success: true };
  } catch (error: any) {
    console.error('Error in replyToMessage:', error);
    return { error: 'No se pudo enviar la respuesta.' };
  }
}
