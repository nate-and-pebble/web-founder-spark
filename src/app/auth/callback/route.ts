import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

async function redirectAfterAuth(request: NextRequest, next: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/deck";

  // PKCE code exchange (OAuth, magic link)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirectAfterAuth(request, next);
    }
  }

  // Token hash verification (email confirmation from signup)
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "signup" | "magiclink",
    });

    if (!error) {
      return redirectAfterAuth(request, next);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}
