import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Email and password (min 6 chars) required" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("app_users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const password_hash = await hashPassword(password);

  const { data: user, error } = await supabaseAdmin
    .from("app_users")
    .insert({ email: email.trim().toLowerCase(), password_hash })
    .select("id, email")
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    redirect: "/onboarding",
  });
}
