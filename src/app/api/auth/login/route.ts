import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: "Configuração do servidor inválida." },
        { status: 500 }
      );
    }

    const externalResponse = await fetch(`${apiBaseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!externalResponse.ok) {
      const errorPayload = await externalResponse.json().catch(() => null);
      const message =
        errorPayload?.message || "E-mail ou senha inválidos.";
      return NextResponse.json(
        { error: message },
        { status: externalResponse.status }
      );
    }

    const payload = await externalResponse.json();
    const token = payload?.token;

    if (!token) {
      return NextResponse.json(
        { error: "Resposta inesperada do servidor." },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
