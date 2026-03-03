import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Configuração do servidor inválida." }, { status: 500 });
  }

  try {
    const externalResponse = await fetch(`${apiBaseUrl}/companies/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const payload = await externalResponse.json().catch(() => null);

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao buscar dados da empresa." },
        { status: externalResponse.status },
      );
    }

    return NextResponse.json({ success: true, data: payload?.data ?? null });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const apiBaseUrl = process.env.API_BASE_URL;
    
    // Valida se é um cadastro novo ou alteração baseado na presença de um ID
    const isUpdate = !!body.id;
    const endpoint = isUpdate ? `${apiBaseUrl}/companies/${body.id}` : `${apiBaseUrl}/companies`;
    const method = isUpdate ? "PUT" : "POST";

    const externalResponse = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(isUpdate ? { "x-company-id": String(body.id) } : {}),
      },
      body: JSON.stringify(body),
    });

    const payload = await externalResponse.json();

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao processar dados da empresa." },
        { status: externalResponse.status }
      );
    }

    // Atualiza o token se a API retornar um novo
    if (payload.token) {
      cookieStore.set("token", payload.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return NextResponse.json({ success: true, data: payload.data });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
