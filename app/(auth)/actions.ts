"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteUrl as appUrl } from "@/lib/urls";

// Google is the only way in for freelancers — no passwords anywhere in the
// product (clients have always signed in by magic link). See DECISIONS.md.
export async function signInWithGoogle(formData?: FormData) {
  const requested = formData?.get("next");
  // Only same-origin paths — never bounce a sign-in to an arbitrary URL.
  const next =
    typeof requested === "string" &&
    requested.startsWith("/") &&
    !requested.startsWith("//")
      ? requested
      : "/app";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
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
