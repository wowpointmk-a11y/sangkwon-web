import { env } from "./env";

export interface LeadNotice {
  bizName: string;
  industry?: string;
  address: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  memo?: string;
  analysisUrl?: string;
}

export async function notifyNewLead(lead: LeadNotice) {
  const tasks: Promise<unknown>[] = [];
  if (env.slackWebhook()) tasks.push(sendSlack(lead));
  if (env.resendKey() && env.leadNotifyEmail()) tasks.push(sendEmail(lead));
  await Promise.allSettled(tasks);
}

async function sendSlack(lead: LeadNotice) {
  const text = [
    `🔥 *새 마케팅 문의*`,
    `• 상호: ${lead.bizName}`,
    lead.industry ? `• 업종: ${lead.industry}` : null,
    `• 주소: ${lead.address}`,
    lead.contactName ? `• 담당: ${lead.contactName}` : null,
    lead.contactPhone ? `• 연락처: ${lead.contactPhone}` : null,
    lead.contactEmail ? `• 이메일: ${lead.contactEmail}` : null,
    lead.memo ? `• 메모: ${lead.memo}` : null,
    lead.analysisUrl ? `• 분석: ${lead.analysisUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(env.slackWebhook()!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function sendEmail(lead: LeadNotice) {
  const html = `
    <h2>새 마케팅 문의가 접수되었습니다</h2>
    <ul>
      <li><b>상호:</b> ${lead.bizName}</li>
      ${lead.industry ? `<li><b>업종:</b> ${lead.industry}</li>` : ""}
      <li><b>주소:</b> ${lead.address}</li>
      ${lead.contactName ? `<li><b>담당자:</b> ${lead.contactName}</li>` : ""}
      ${lead.contactPhone ? `<li><b>연락처:</b> ${lead.contactPhone}</li>` : ""}
      ${lead.contactEmail ? `<li><b>이메일:</b> ${lead.contactEmail}</li>` : ""}
      ${lead.memo ? `<li><b>메모:</b> ${lead.memo}</li>` : ""}
    </ul>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.leadNotifyFrom(),
      to: [env.leadNotifyEmail()!],
      subject: `[상권분석] 새 문의: ${lead.bizName}`,
      html,
    }),
  });
}
