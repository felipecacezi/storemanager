export class CurrencyUtils {
    /**
     * Converte um valor decimal (ex: 10.50) para centavos (ex: 1050).
     */
    static toCents(decimalValue: number | string | undefined | null): number {
        if (decimalValue === undefined || decimalValue === null || decimalValue === "") {
            return 0;
        }

        // If it's a string, we need to clean it (remove R$, dots, etc. and handle comma)
        if (typeof decimalValue === "string") {
            const cleaned = decimalValue
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim();
            const numericValue = parseFloat(cleaned);
            return Math.round((isNaN(numericValue) ? 0 : numericValue) * 100);
        }

        return Math.round(decimalValue * 100);
    }

    /**
     * Converte um valor em centavos (ex: 1050) para decimal (ex: 10.5).
     */
    static toDecimal(centsValue: number | undefined | null): number {
        if (centsValue === undefined || centsValue === null) {
            return 0;
        }
        return centsValue / 100;
    }

    /**
     * Formata um valor numérico para o padrão de moeda BRL (ex: R$ 1.234,56).
     */
    static formatBRL(value: number | string | undefined | null): string {
        const numericValue = typeof value === "string" ? parseFloat(value.replace(/\D/g, "")) / 100 : value;

        if (numericValue === undefined || numericValue === null || isNaN(numericValue as number)) {
            return "R$ 0,00";
        }

        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(numericValue as number);
    }

    /**
     * Remove a máscara e retorna apenas números como string.
     */
    static unmask(value: string): string {
        return value.replace(/\D/g, "");
    }
}
