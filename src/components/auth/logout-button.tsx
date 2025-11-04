"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you'd also call a server action to destroy the session
    router.push("/");
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  );
}
