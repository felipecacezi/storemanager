import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "Configuração do servidor inválida." }, { status: 500 });
    }

    const payload: Record<string, unknown> = {
      email: body.email,
    };

    if (body.password) {
      payload.password = body.password;
      payload.confirm_password = body.confirmPassword;
    }

    const externalResponse = await fetch(`${apiBaseUrl}/user`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await externalResponse.json();

    if (!externalResponse.ok) {
      return NextResponse.json(
        { error: responseBody?.message || "Erro ao atualizar perfil." },
        { status: externalResponse.status }
      );
    }

    const authorizationHeader =
      externalResponse.headers.get("authorization") ??
      externalResponse.headers.get("Authorization");
    const newToken = authorizationHeader?.replace(/^Bearer\s*/i, "").trim();

    if (newToken) {
      cookieStore.delete("token");
      cookieStore.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return NextResponse.json({ success: true, data: responseBody.data });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
