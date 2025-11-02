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
        return { error: "Invalid input." };
    }

    const { email, password } = validatedFields.data;

    // Simulate authentication logic
    if (email === "user@example.com" && password === "password") {
        // Successful login, will redirect
        console.log("Login successful for:", email);
    } else {
        // Failed login
        console.log("Login failed for:", email);
        return { error: "Invalid email or password." };
    }
    
    // This part is only reached on success
    redirect('/dashboard');
}
