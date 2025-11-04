import { LogoutButton } from '@/components/auth/logout-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Painel</CardTitle>
          <CardDescription>Bem-vindo ao seu AssistManager!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Seu resumo de negócios e ferramentas de gerenciamento estão aqui.</p>
          <div className="flex justify-center gap-4">
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
