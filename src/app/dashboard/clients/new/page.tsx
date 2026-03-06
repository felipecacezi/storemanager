"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ClientSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z
    .string()
    .min(1, { message: "O e-mail é obrigatório." })
    .email({ message: "Por favor, insira um endereço de e-mail válido." }),
  document: z.string().min(1, { message: "O documento é obrigatório." }),
  phone: z.string().min(1, { message: "O telefone é obrigatório." }),
  is_whatsapp: z.boolean().default(false),
  country: z.string().optional().or(z.literal("")),
  zipcode: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  status: z.enum(["Ativo", "Inativo"]),
});

const formatCnpjCpf = (value: string) => {
  const cleanedValue = (value || "").replace(/\D/g, "");

  if (cleanedValue.length <= 11) {
    // CPF
    return cleanedValue
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  // CNPJ
  return cleanedValue
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const formatPhone = (value: string) => {
  const cleanedValue = (value || "").replace(/\D/g, "");
  if (cleanedValue.length <= 10) {
    return cleanedValue
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return cleanedValue
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

export default function NewClientPage() {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editIdParam = searchParams.get("id");
  const editId = editIdParam ? Number(editIdParam) : undefined;
  const isEditMode = !!editId && !Number.isNaN(editId);

  const form = useForm<z.infer<typeof ClientSchema>>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      name: "",
      email: "",
      document: "",
      phone: "",
      is_whatsapp: false,
      country: "Brasil",
      zipcode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      status: "Ativo",
    },
  });

  React.useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;

    const loadClient = async () => {
      try {
        const response = await fetch(`/api/clients/${editId}`, { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error || "Erro ao buscar cliente.");
        }

        const client = data?.data;
        if (!client || !isMounted) return;

        form.reset({
          name: client.name ?? "",
          email: client.email ?? "",
          document: client.document ?? "",
          phone: client.phone ?? "",
          is_whatsapp: !!client.is_whatsapp,
          country: client.country ?? "Brasil",
          zipcode: client.zipcode ?? "",
          address: client.address ?? "",
          number: client.number ?? "",
          complement: client.complement ?? "",
          neighborhood: client.neighborhood ?? "",
          city: client.city ?? "",
          state: client.state ?? "",
          status: client.status === false || client.status === 0 ? "Inativo" : "Ativo",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error?.message || "Erro ao buscar cliente.",
        });
      }
    };

    loadClient();

    return () => {
      isMounted = false;
    };
  }, [editId, form, isEditMode, toast]);

  const onSubmit = (values: z.infer<typeof ClientSchema>) => {
    startTransition(async () => {
      try {
        const url = isEditMode ? `/api/clients/${editId}` : "/api/clients";
        const method = isEditMode ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Erro ao salvar cliente.");
        }

        toast({
          title: isEditMode ? "Cliente atualizado!" : "Cliente cadastrado!",
          description: data?.message || "Operação realizada com sucesso.",
        });

        router.push("/dashboard/clients");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error?.message || "Erro ao salvar cliente.",
        });
      }
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
          {isEditMode ? "Editar Cliente" : "Adicionar Novo Cliente"}
        </h1>
      </div>

      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para {isEditMode ? "atualizar" : "adicionar"} o cliente.
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
                  name="document"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                  name="is_whatsapp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 pb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                          id="is_whatsapp"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="is_whatsapp"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        É WhatsApp?
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="00000-000"
                          disabled={isPending}
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Rua das Flores"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Apto 12"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Centro"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="São Paulo"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="SP"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Brasil"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
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
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isEditMode ? (
                    "Salvar Alterações"
                  ) : (
                    "Salvar Cliente"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
