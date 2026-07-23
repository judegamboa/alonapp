"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { siteUrl as appUrl } from "@/lib/urls";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUp(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(
      `/signup?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${appUrl()}/auth/callback?next=/app` },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Local dev has email confirmations off, so a session may exist already.
  if (data.session) {
    redirect("/app");
  }
  redirect("/login?message=Check your email to confirm your account");
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(
      `/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    redirect(`/login?error=${encodeURIComponent("Invalid email or password")}`);
  }
  redirect("/app");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl()}/auth/callback?next=/app` },
  });
  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent("Google sign-in is unavailable")}`
    );
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
