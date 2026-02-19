'use server';

import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/app/actions/audit';
import type { GoUpdateStatusType } from '@/features/group-orders';

/* ─── publishGoUpdate ─── */

interface PublishParams {
  groupOrderId: string;
  title: string;
  content: string;
  statusType: GoUpdateStatusType;
  imageUrl: string | null;
  /** If true, sends email to all participants who paid Pago 1 */
  notifyAll: boolean;
}

interface PublishResult {
  updateId?: string;
  notified?: number;
  error?: string;
}

/**
 * Inserts a new row in go_updates and optionally triggers email notifications.
 * Must be called from an admin-authenticated context.
 */
export async function publishGoUpdate(params: PublishParams): Promise<PublishResult> {
  const { groupOrderId, title, content, statusType, imageUrl, notifyAll } = params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('go_updates')
    .insert({
      group_order_id: groupOrderId,
      title,
      content,
      status_type: statusType,
      image_url: imageUrl ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('publishGoUpdate error:', error);
    return { error: 'No se pudo guardar la actualización.' };
  }

  await logAuditAction('GO_UPDATE_PUBLISHED', {
    groupOrderId,
    updateId: data.id,
    statusType,
    notifyAll,
  });

  if (!notifyAll) {
    return { updateId: data.id, notified: 0 };
  }

  // Trigger email notifications
  const { notified, error: notifyError } = await notifyParticipants(data.id);

  if (notifyError) {
    // Don't fail the whole request — the update was saved successfully
    console.error('notifyParticipants error:', notifyError);
    return { updateId: data.id, notified: 0, error: notifyError };
  }

  return { updateId: data.id, notified };
}


/* ─── notifyParticipants ─── */

interface NotifyResult {
  notified: number;
  error?: string;
}

/**
 * Sends an email to every participant who paid Pago 1 for the GO
 * linked to the given go_update row.
 *
 * Uses Resend (RESEND_API_KEY must be set). If the key is missing the
 * function returns successfully with notified = 0 so the rest of the
 * flow isn't blocked in development.
 */
export async function notifyParticipants(updateId: string): Promise<NotifyResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('notifyParticipants: RESEND_API_KEY not set — skipping emails.');
    return { notified: 0 };
  }

  const supabase = await createClient();

  // 1. Load the update + its parent GO title
  const { data: update, error: updateError } = await supabase
    .from('go_updates')
    .select('id, title, content, group_order_id, group_orders ( title )')
    .eq('id', updateId)
    .single();

  if (updateError || !update) {
    return { notified: 0, error: 'No se encontró la actualización.' };
  }

  const goTitle =
    (update.group_orders as { title?: string } | null)?.title ?? 'tu pedido grupal';

  // 2. Fetch participants who paid Pago 1 and have an email
  const { data: participants, error: partError } = await supabase
    .from('group_order_participants')
    .select('user_id, profiles ( email )')
    .eq('group_order_id', update.group_order_id)
    .eq('payment_1_status', 'PAID');

  if (partError || !participants) {
    return { notified: 0, error: 'No se pudieron obtener los participantes.' };
  }

  const emails = participants
    .map(p => (p.profiles as { email?: string } | null)?.email)
    .filter((e): e is string => !!e && e.includes('@'));

  if (emails.length === 0) {
    return { notified: 0 };
  }

  // 3. Send emails via Resend
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://stanstore.com';
  const statusUrl = `${baseUrl}/es/account/orders`;

  const html = buildEmailHtml({
    goTitle,
    updateTitle: update.title as string,
    content: update.content as string,
    statusUrl,
  });

  let notified = 0;

  // Send individually to avoid BCC leaking addresses to each recipient
  const results = await Promise.allSettled(
    emails.map(to =>
      resend.emails.send({
        from: 'StanStore <no-reply@stanstore.com>',
        to,
        subject: `Actualización de tu pedido: ${update.title}`,
        html,
      })
    )
  );

  notified = results.filter(r => r.status === 'fulfilled').length;

  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`notifyParticipants: ${failed} emails failed to send.`);
  }

  await logAuditAction('GO_PARTICIPANTS_NOTIFIED', {
    updateId,
    groupOrderId: update.group_order_id,
    total: emails.length,
    notified,
    failed,
  });

  return { notified };
}

/* ─── Email template ─── */

function buildEmailHtml({
  goTitle,
  updateTitle,
  content,
  statusUrl,
}: {
  goTitle: string;
  updateTitle: string;
  content: string;
  statusUrl: string;
}) {
  // Convert newlines to <br> for basic Markdown-ish rendering
  const htmlContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:1.3rem;font-weight:700">StanStore 📦</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 4px;font-size:0.8rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">
              Actualización de tu GO
            </p>
            <h1 style="margin:0 0 6px;font-size:1.25rem;color:#111">${updateTitle}</h1>
            <p style="margin:0 0 20px;font-size:0.85rem;color:#6b7280">${goTitle}</p>

            <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;font-size:0.9rem;color:#374151;line-height:1.6">
              ${htmlContent}
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
              <tr><td align="center">
                <a href="${statusUrl}"
                   style="display:inline-block;background:#111;color:#fff;padding:14px 32px;
                          border-radius:10px;text-decoration:none;font-weight:700;font-size:0.95rem">
                  Ver estado completo en la web →
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:0.75rem;color:#9ca3af;text-align:center">
              Recibiste este correo porque participas en un pedido grupal de StanStore.<br>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/es/account" style="color:#6b7280">
                Administrar preferencias de notificación
              </a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
