'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

export async function authenticate(values: z.infer<typeof LoginSchema>) {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Entrada inválida." };
    }
    
    // Para fins de demonstração, qualquer login é bem-sucedido.
    redirect('/dashboard');
}
