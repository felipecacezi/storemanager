import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, rotateTokenFromResponseHeaders } from "../_helpers";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const externalResponse = await fetch(`${auth.apiBaseUrl}/clients/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "x-company-id": String(auth.companyId),
      },
      cache: "no-store",
    });

    const payload = await externalResponse.json().catch(() => null);

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao buscar cliente." },
        { status: externalResponse.status }
      );
    }

    rotateTokenFromResponseHeaders(externalResponse, auth.cookieStore);

    return NextResponse.json({ success: true, data: payload?.data ?? null });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

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

    const externalResponse = await fetch(`${auth.apiBaseUrl}/clients/${id}`, {
      method: "PUT",
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
        { error: payload?.message || "Erro ao atualizar cliente." },
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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthContext();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const externalResponse = await fetch(`${auth.apiBaseUrl}/clients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "x-company-id": String(auth.companyId),
      },
    });

    const payload = await externalResponse.json().catch(() => null);

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao remover cliente." },
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
