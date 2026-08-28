"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { clients, nudges, packs, sessions, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "./auth";
import { renewalMessage, sendEmail } from "./email";
import { getPackView } from "./packs";

export type ActionState = { error?: string; ok?: string };

const fail = (error: string): ActionState => ({ error });

function refreshApp() {
  revalidatePath("/app", "layout");
}

/** Strips empty-string form values down to null so the DB stays clean. */
const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable();

/** Parses a yyyy-mm-dd <input type="date"> value at local noon to dodge TZ drift. */
function parseDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/* ------------------------------------------------------------------ auth -- */

const registerSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  businessName: optionalText,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    businessName: formData.get("businessName"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { name, email, businessName, password } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return fail("An account with that email already exists.");

  const [user] = await db
    .insert(users)
    .values({ name, email, businessName, passwordHash: await hashPassword(password) })
    .returning();

  await createSession(user.id);
  redirect("/app");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  // Same message either way so the form can't be used to enumerate accounts.
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return fail("That email and password don't match.");
  }

  await createSession(user.id);
  redirect("/app");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

/* --------------------------------------------------------------- clients -- */

const clientSchema = z.object({
  name: z.string().trim().min(1, "Please enter a name."),
  email: z
    .union([z.string().trim().email("That email address doesn't look right."), z.literal("")])
    .transform((v) => (v === "" ? null : v)),
  phone: optionalText,
  notes: optionalText,
});

export async function createClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  await db.insert(clients).values({ userId: user.id, ...parsed.data });
  refreshApp();
  return { ok: `${parsed.data.name} added.` };
}

export async function updateClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const clientId = Number(formData.get("clientId"));
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const result = await db
    .update(clients)
    .set(parsed.data)
    .where(and(eq(clients.id, clientId), eq(clients.userId, user.id)))
    .returning({ id: clients.id });
  if (!result.length) return fail("That client no longer exists.");

  refreshApp();
  return { ok: "Saved." };
}

export async function archiveClientAction(formData: FormData) {
  const user = await requireUser();
  const clientId = Number(formData.get("clientId"));

  await db
    .update(clients)
    .set({ archivedAt: new Date() })
    .where(and(eq(clients.id, clientId), eq(clients.userId, user.id)));

  refreshApp();
  redirect("/app/clients");
}

/* ----------------------------------------------------------------- packs -- */

export async function createPackAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const clientId = Number(formData.get("clientId"));
  const totalSessions = Number(formData.get("totalSessions"));
  const priceRaw = String(formData.get("price") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;

  if (!Number.isInteger(totalSessions) || totalSessions < 1 || totalSessions > 500) {
    return fail("Sessions must be a whole number between 1 and 500.");
  }

  const owned = await db.query.clients.findFirst({
    where: and(eq(clients.id, clientId), eq(clients.userId, user.id)),
  });
  if (!owned) return fail("Pick a client for this pack.");

  const price = priceRaw === "" ? null : Number(priceRaw);
  if (price !== null && (Number.isNaN(price) || price < 0)) {
    return fail("Price must be a positive number.");
  }

  await db.insert(packs).values({
    userId: user.id,
    clientId,
    label,
    totalSessions,
    priceMinor: price === null ? null : Math.round(price * 100),
    currency: String(formData.get("currency") ?? "USD"),
    purchasedAt: parseDate(formData.get("purchasedAt")) ?? new Date(),
    expiresAt: parseDate(formData.get("expiresAt")),
  });

  refreshApp();
  return { ok: `Pack of ${totalSessions} added for ${owned.name}.` };
}

export async function setPackStatusAction(formData: FormData) {
  const user = await requireUser();
  const packId = Number(formData.get("packId"));
  const status = formData.get("status") === "closed" ? "closed" : "active";

  await db
    .update(packs)
    .set({ status })
    .where(and(eq(packs.id, packId), eq(packs.userId, user.id)));

  refreshApp();
}

export async function deletePackAction(formData: FormData) {
  const user = await requireUser();
  const packId = Number(formData.get("packId"));

  await db.delete(packs).where(and(eq(packs.id, packId), eq(packs.userId, user.id)));
  refreshApp();
}

/* -------------------------------------------------------------- sessions -- */

export async function logSessionAction(formData: FormData) {
  const user = await requireUser();
  const packId = Number(formData.get("packId"));

  const pack = await db.query.packs.findFirst({
    where: and(eq(packs.id, packId), eq(packs.userId, user.id)),
  });
  if (!pack) return;

  await db.insert(sessions).values({
    userId: user.id,
    packId,
    occurredAt: parseDate(formData.get("occurredAt")) ?? new Date(),
    note: String(formData.get("note") ?? "").trim() || null,
  });

  refreshApp();
}

/** Removes the most recent session on a pack — the "oops, mis-tap" undo. */
export async function undoSessionAction(formData: FormData) {
  const user = await requireUser();
  const packId = Number(formData.get("packId"));

  const latest = await db.query.sessions.findFirst({
    where: and(eq(sessions.packId, packId), eq(sessions.userId, user.id)),
    orderBy: [desc(sessions.occurredAt), desc(sessions.id)],
  });
  if (!latest) return;

  await db.delete(sessions).where(eq(sessions.id, latest.id));
  refreshApp();
}

export async function deleteSessionAction(formData: FormData) {
  const user = await requireUser();
  const sessionId = Number(formData.get("sessionId"));

  await db
    .delete(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)));
  refreshApp();
}

/* ---------------------------------------------------------------- nudges -- */

export async function sendNudgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const packId = Number(formData.get("packId"));

  const view = await getPackView(user.id, packId, user.lowThreshold);
  if (!view) return fail("That pack no longer exists.");
  if (!view.client.email) return fail(`Add an email address for ${view.client.name} first.`);

  // Let the trainer edit the draft before it goes out; fall back to the default.
  const drafted = renewalMessage(view, user);
  const subject = String(formData.get("subject") ?? "").trim() || drafted.subject;
  const text = String(formData.get("body") ?? "").trim() || drafted.text;

  const result = await sendEmail({
    to: view.client.email,
    subject,
    text,
    replyTo: user.email,
  });

  await db.insert(nudges).values({
    userId: user.id,
    clientId: view.client.id,
    packId: view.pack.id,
    remainingAtSend: view.remaining,
    toEmail: view.client.email,
    subject,
    body: text,
    status: result.ok ? "sent" : "failed",
    error: result.ok ? null : result.error,
  });

  refreshApp();
  return result.ok
    ? { ok: `Renewal message sent to ${view.client.name}.` }
    : fail(`Couldn't send: ${result.error}`);
}

/* -------------------------------------------------------------- settings -- */

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return fail("Please enter your name.");

  const lowThreshold = Number(formData.get("lowThreshold"));
  if (!Number.isInteger(lowThreshold) || lowThreshold < 1 || lowThreshold > 20) {
    return fail("The warning threshold must be between 1 and 20 sessions.");
  }

  await db
    .update(users)
    .set({
      name,
      businessName: String(formData.get("businessName") ?? "").trim() || null,
      lowThreshold,
      dailyDigest: formData.get("dailyDigest") === "on",
    })
    .where(eq(users.id, user.id));

  refreshApp();
  return { ok: "Settings saved." };
}
