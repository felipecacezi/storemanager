import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, rotateTokenFromResponseHeaders } from "../clients/_helpers";
import { CurrencyUtils } from "@/lib/currency-utils";

export async function GET(request: NextRequest) {
    const auth = await getAuthContext();
    if (!auth.ok) return auth.response;

    const url = request.nextUrl;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "100");
    const status = url.searchParams.get("status");

    try {
        const queryParams = new URLSearchParams({
            page: String(page || 1),
            limit: String(limit || 100),
        });

        if (status) {
            queryParams.append("status", status);
        }

        const externalResponse = await fetch(
            `${auth.apiBaseUrl}/products?${queryParams.toString()}`,
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
                { error: payload?.message || "Erro ao buscar produtos." },
                { status: externalResponse.status }
            );
        }

        rotateTokenFromResponseHeaders(externalResponse, auth.cookieStore);

        const products = (payload?.data ?? []).map((product: any) => ({
            ...product,
            cost_price: CurrencyUtils.toDecimal(product.cost_price),
            sell_price: CurrencyUtils.toDecimal(product.sell_price),
        }));

        return NextResponse.json({ success: true, data: products });
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
            cost_price: CurrencyUtils.toCents(body?.costPrice),
            sell_price: CurrencyUtils.toCents(body?.price),
            status: body?.status === "Ativo" || body?.status === true,
        };

        // Remove frontend specific fields
        delete (payloadToApi as any).costPrice;
        delete (payloadToApi as any).price;
        delete (payloadToApi as any).stock;

        const externalResponse = await fetch(`${auth.apiBaseUrl}/products`, {
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
                { error: payload?.message || "Erro ao criar produto." },
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
