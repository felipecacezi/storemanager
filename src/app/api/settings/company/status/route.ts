import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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
    const response = await fetch(`${apiBaseUrl}/user/company-status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.message || "Erro ao consultar status da empresa." },
        { status: response.status },
      );
    }

    return NextResponse.json({ hasCompany: !!payload?.data?.hasCompany, companyId: payload?.data?.companyId });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar status da empresa." }, { status: 500 });
  }
}
