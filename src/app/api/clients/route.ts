import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, rotateTokenFromResponseHeaders } from "./_helpers";

export async function GET(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.ok) return auth.response;

  const url = request.nextUrl;
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "100");
  const search = url.searchParams.get("search") ?? undefined;

  try {
    const queryParams = new URLSearchParams({
      page: String(page || 1),
      limit: String(limit || 100),
      ...(search ? { search } : {}),
    });

    const externalResponse = await fetch(
      `${auth.apiBaseUrl}/clients?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "x-company-id": String(auth.companyId),
        },
        cache: "no-store",
      }
    );

    const payload = await externalResponse.json().catch(() => null);

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao buscar clientes." },
        { status: externalResponse.status }
      );
    }

    rotateTokenFromResponseHeaders(externalResponse, auth.cookieStore);

    return NextResponse.json({ success: true, data: payload?.data ?? [] });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    const payloadToApi = {
      ...body,
      status:
        body?.status === "Ativo"
          ? true
          : body?.status === "Inativo"
            ? false
            : body?.status,
    };

    const externalResponse = await fetch(`${auth.apiBaseUrl}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
        "x-company-id": String(auth.companyId),
      },
      body: JSON.stringify(payloadToApi),
    });

    const payload = await externalResponse.json().catch(() => null);

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao criar cliente." },
        { status: externalResponse.status }
      );
    }

    rotateTokenFromResponseHeaders(externalResponse, auth.cookieStore);

    return NextResponse.json({ success: true, message: payload?.message });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
