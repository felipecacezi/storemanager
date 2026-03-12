import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, rotateTokenFromResponseHeaders } from "../../clients/_helpers";
import { CurrencyUtils } from "@/lib/currency-utils";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const auth = await getAuthContext();
    if (!auth.ok) return auth.response;

    const { id } = await context.params;

    try {
        const externalResponse = await fetch(`${auth.apiBaseUrl}/products/${id}`, {
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
                { error: payload?.message || "Erro ao buscar produto." },
                { status: externalResponse.status }
            );
        }

        rotateTokenFromResponseHeaders(externalResponse, auth.cookieStore);

        const product = payload?.data ? {
            ...payload.data,
            cost_price: CurrencyUtils.toDecimal(payload.data.cost_price),
            sell_price: CurrencyUtils.toDecimal(payload.data.sell_price),
        } : null;

        return NextResponse.json({ success: true, data: product });
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
            cost_price: body?.costPrice !== undefined ? CurrencyUtils.toCents(body.costPrice) : undefined,
            sell_price: body?.price !== undefined ? CurrencyUtils.toCents(body.price) : undefined,
            status: body?.status === "Ativo" || body?.status === true,
        };

        // Remove frontend specific fields
        delete (payloadToApi as any).costPrice;
        delete (payloadToApi as any).price;
        delete (payloadToApi as any).stock;

        const externalResponse = await fetch(`${auth.apiBaseUrl}/products/${id}`, {
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
                { error: payload?.message || "Erro ao atualizar produto." },
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
        const externalResponse = await fetch(`${auth.apiBaseUrl}/products/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${auth.token}`,
                "x-company-id": String(auth.companyId),
            },
        });

        const payload = await externalResponse.json().catch(() => null);

        if (!externalResponse.ok) {
            return NextResponse.json(
                { error: payload?.message || "Erro ao remover produto." },
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
