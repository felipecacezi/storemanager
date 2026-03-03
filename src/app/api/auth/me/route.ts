import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const payload = decodeJwt(token);
    const email = typeof payload.email === "string" ? payload.email : undefined;

    return NextResponse.json({ email });
  } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }
}
