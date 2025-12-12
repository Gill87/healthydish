// app/auth/callback/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export default async function OAuthCallbackPage() {
  // create server supabase client that reads session from cookies
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  try {
    // try to read the session/user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If we have a user, redirect to home/dashboard
    if (user) {
      // optionally: you can inspect session to route users differently
      redirect("/home");
    }

    // If no user is found, sometimes the provider redirect arrives before cookies are set.
    // We can wait a tiny bit and try again (brief retry).
    await new Promise((r) => setTimeout(r, 400)); // 400ms retry
    const {
      data: { user: retriedUser },
    } = await supabase.auth.getUser();

    if (retriedUser) {
      redirect("/home");
    }

    // fallback: if still no user, send to sign-in with an optional query param
    redirect("/signin?oauth=failed");
  } catch (err) {
    console.error("OAuth callback error:", err);
    // on error send users to sign in page (you may show a message there)
    redirect("/signin?oauth=error");
  }
}
