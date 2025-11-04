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

    const { email, password } = validatedFields.data;

    // Simulate authentication logic
    if (email === "user@example.com" && password === "password") {
        // Successful login, will redirect
        console.log("Login bem-sucedido para:", email);
    } else {
        // Failed login
        console.log("Falha no login para:", email);
        return { error: "Email ou senha inválidos." };
    }
    
    // This part is only reached on success
    redirect('/dashboard');
}
