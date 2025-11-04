"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const ClientSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
  cnpjCpf: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["Ativo", "Inativo"]),
});

const formatCnpjCpf = (value: string) => {
  const cleanedValue = (value || '').replace(/\D/g, '');

  if (cleanedValue.length <= 11) {
    // CPF
    return cleanedValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ
    return cleanedValue
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

const formatPhone = (value: string) => {
  const cleanedValue = (value || '').replace(/\D/g, '');
  if (cleanedValue.length <= 10) {
    return cleanedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    return cleanedValue
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};


export default function NewClientPage() {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof ClientSchema>>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      name: "",
      email: "",
      cnpjCpf: "",
      phone: "",
      address: "",
      status: "Ativo",
    },
  });

  const onSubmit = (values: z.infer<typeof ClientSchema>) => {
    startTransition(async () => {
      // Aqui você adicionaria a lógica para salvar o cliente no banco de dados.
      // Por enquanto, vamos apenas simular e mostrar uma notificação.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Cliente Adicionado!",
        description: `${values.name} foi adicionado com sucesso.`,
      });
      router.push("/dashboard/clients");
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/clients">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Adicionar Novo Cliente
          </h1>
        </div>
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>
            Preencha os detalhes abaixo para adicionar um novo cliente.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome Completo / Razão Social</FormLabel>
                    <FormControl>
                        <Input 
                        placeholder="Ex: João da Silva" 
                        {...field} 
                        disabled={isPending}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input 
                            type="email" 
                            placeholder="nome@exemplo.com" 
                            {...field} 
                            disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpjCpf"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>CNPJ / CPF</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="00.000.000/0000-00"
                              disabled={isPending}
                              onChange={(e) => field.onChange(formatCnpjCpf(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                           <Input
                             {...field}
                             placeholder="(11) 98765-4321"
                             disabled={isPending}
                             onChange={(e) => field.onChange(formatPhone(e.target.value))}
                           />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                            <Input 
                            placeholder="Rua das Flores, 123 - São Paulo, SP" 
                            {...field} 
                            disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status do cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/clients">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Cliente"}
                    </Button>
                </div>
            </form>
            </Form>
        </CardContent>
        </Card>
    </main>
  );
}
