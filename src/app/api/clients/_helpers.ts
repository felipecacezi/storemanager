import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type AuthContextOk = {
  ok: true;
  apiBaseUrl: string;
  token: string;
  companyId: number;
  cookieStore: CookieStore;
};

type AuthContextError = {
  ok: false;
  response: NextResponse;
};

export type AuthContext = AuthContextOk | AuthContextError;

export function rotateTokenFromResponseHeaders(
  externalResponse: Response,
  cookieStore: CookieStore
) {
  const authorizationHeader =
    externalResponse.headers.get("authorization") ??
    externalResponse.headers.get("Authorization");
  const newToken = authorizationHeader?.replace(/^Bearer\s*/i, "").trim();

  if (!newToken) return;

  cookieStore.delete("token");
  cookieStore.set("token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Não autorizado." }, { status: 401 }),
    };
  }

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Configuração do servidor inválida." },
        { status: 500 }
      ),
    };
  }

  try {
    const statusResponse = await fetch(`${apiBaseUrl}/user/company-status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const payload = await statusResponse.json().catch(() => null);

    if (!statusResponse.ok) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: payload?.message || "Erro ao consultar status da empresa." },
          { status: statusResponse.status }
        ),
      };
    }

    const rawCompanyId = payload?.data?.companyId;
    const companyId =
      typeof rawCompanyId === "number"
        ? rawCompanyId
        : typeof rawCompanyId === "string"
          ? Number(rawCompanyId)
          : NaN;

    if (!companyId || Number.isNaN(companyId) || companyId <= 0) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Empresa não cadastrada." },
          { status: 400 }
        ),
      };
    }

    return { ok: true, apiBaseUrl, token, companyId, cookieStore };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Erro ao consultar status da empresa." },
        { status: 500 }
      ),
    };
  }
}
