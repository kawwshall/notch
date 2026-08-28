import "server-only";

import { Resend } from "resend";

import type { PackView } from "./packs";
import type { User } from "@/db/schema";

export type SendResult = { ok: true; id: string | null } | { ok: false; error: string };

const FROM = process.env.RESEND_FROM ?? "SessionPack <onboarding@resend.dev>";

let client: Resend | null = null;
function resend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const api = resend();

  // No API key configured: log instead of throwing, so the whole app still
  // works locally and nudges are recorded as "failed" rather than crashing.
  if (!api) {
    console.info(`[email:dry-run] to=${args.to} subject=${args.subject}\n${args.text}`);
    return { ok: false, error: "RESEND_API_KEY is not configured (email not sent)" };
  }

  try {
    const { data, error } = await api.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      text: args.text,
      ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function signOff(user: User) {
  return user.businessName ? `${user.name}\n${user.businessName}` : user.name;
}

/**
 * The renewal message. Deliberately written as if the trainer typed it — no
 * branding, no marketing voice, because it goes out under their name.
 */
export function renewalMessage(view: PackView, user: User) {
  const { client, remaining, pack } = view;
  const firstName = client.name.split(" ")[0];
  const packName = pack.label ? `your ${pack.label}` : "your session pack";

  const subject =
    remaining <= 0
      ? `${firstName} — that was the last session in ${packName}`
      : remaining === 1
        ? `${firstName} — one session left`
        : `${firstName} — ${remaining} sessions left`;

  const opening =
    remaining <= 0
      ? `Just a heads up that we've now used all ${pack.totalSessions} sessions in ${packName}.`
      : remaining === 1
        ? `Quick note — you have 1 session left in ${packName}.`
        : `Quick note — you have ${remaining} sessions left in ${packName}.`;

  const text = [
    `Hi ${firstName},`,
    "",
    opening,
    "",
    remaining <= 0
      ? "Let me know if you'd like to set up another pack and we'll keep your usual slot."
      : "Happy to get the next pack booked in so there's no gap in your schedule — just reply and let me know.",
    "",
    "Thanks,",
    signOff(user),
  ].join("\n");

  return { subject, text };
}

/** Daily digest to the trainer, listing who needs a renewal message today. */
export function digestMessage(views: PackView[], user: User) {
  const lines = views.map((v) => {
    const left = v.remaining <= 0 ? "no sessions left" : `${v.remaining} left`;
    return `• ${v.client.name} — ${left}${v.pack.label ? ` (${v.pack.label})` : ""}`;
  });

  const subject =
    views.length === 1
      ? `1 client needs a renewal message`
      : `${views.length} clients need a renewal message`;

  const text = [
    `Hi ${user.name.split(" ")[0]},`,
    "",
    views.length === 1
      ? "One client is nearly out of sessions:"
      : `${views.length} clients are nearly out of sessions:`,
    "",
    ...lines,
    "",
    `Open SessionPack to send their renewal messages: ${process.env.APP_URL ?? "http://localhost:3000"}/app`,
    "",
    "— SessionPack",
  ].join("\n");

  return { subject, text };
}
