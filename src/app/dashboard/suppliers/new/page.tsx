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


const SupplierSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um endereço de e-mail válido." }),
  cnpjCpf: z.string().optional(),
  phone: z.string().optional(),
  isWhatsapp: z.boolean().default(false).optional(),
  zipcode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  complement: z.string().optional(),
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


export default function NewSupplierPage() {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editIdParam = searchParams.get("id");
  const editId = editIdParam ? Number(editIdParam) : undefined;
  const isEditMode = !!editId && !Number.isNaN(editId);

  const form = useForm<z.infer<typeof SupplierSchema>>({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: "",
      email: "",
      cnpjCpf: "",
      phone: "",
      isWhatsapp: false,
      zipcode: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
      status: "Ativo",
    },
  });

  React.useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;

    const loadSupplier = async () => {
      try {
        const response = await fetch(`/api/vendors/${editId}`, { cache: "no-store" });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Erro ao buscar fornecedor.");
        }

        const supplier = data?.data;
        if (!supplier || !isMounted) return;

        form.reset({
          name: supplier.name ?? "",
          email: supplier.contact?.email ?? supplier.email ?? "",
          cnpjCpf: supplier.cnpjCpf ?? supplier.document ?? "",
          phone: supplier.contact?.phone ?? supplier.phone ?? "",
          isWhatsapp: !!supplier.contact?.isWhatsapp ?? !!supplier.isWhatsapp,
          zipcode: supplier.zipcode ?? "",
          address: supplier.address ?? "",
          number: supplier.number ?? "",
          neighborhood: supplier.neighborhood ?? "",
          city: supplier.city ?? "",
          state: supplier.state ?? "",
          complement: supplier.complement ?? "",
          status: supplier.status === false || supplier.status === 0 || supplier.status === "Inativo" ? "Inativo" : "Ativo",
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error?.message || "Erro ao buscar fornecedor.",
        });
      }
    };

    loadSupplier();

    return () => {
      isMounted = false;
    };
  }, [editId, form, isEditMode, toast]);

  const onSubmit = (values: z.infer<typeof SupplierSchema>) => {
    startTransition(async () => {
      try {
        const url = isEditMode ? `/api/vendors/${editId}` : "/api/vendors";
        const method = isEditMode ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Erro ao salvar fornecedor.");
        }

        toast({
          title: isEditMode ? "Fornecedor atualizado!" : "Fornecedor cadastrado!",
          description: data?.message || "Operação realizada com sucesso.",
        });

        router.push("/dashboard/suppliers");
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error?.message || "Erro ao salvar fornecedor.",
        });
      }
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboard/suppliers">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {isEditMode ? "Editar Fornecedor" : "Adicionar Novo Fornecedor"}
        </h1>
      </div>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Informações do Fornecedor</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para {isEditMode ? "atualizar" : "adicionar"} o fornecedor.
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
                        placeholder="Ex: Fornecedor XYZ Ltda"
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
                          placeholder="contato@fornecedor.com"
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
                  name="isWhatsapp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 pb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                          id="isWhatsapp"
                        />
                      </FormControl>
                      <FormLabel htmlFor="isWhatsapp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                          placeholder="00000-000"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro (Rua/Avenida)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Avenida Principal"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 123"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Centro"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Belo Horizonte"
                            {...field}
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado (UF)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: MG"
                          {...field}
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
                name="complement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Bloco A, Apto 101"
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status do fornecedor" />
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
                  <Link href="/dashboard/suppliers">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isEditMode ? (
                    "Salvar Alterações"
                  ) : (
                    "Salvar Fornecedor"
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
