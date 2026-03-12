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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CurrencyUtils } from "@/lib/currency-utils";

const ProductSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  costPrice: z.string().min(1, { message: "O preço de custo é obrigatório." }),
  price: z.string().min(1, { message: "O preço de venda é obrigatório." }),
  stock: z.coerce.number().min(0, { message: "O estoque não pode ser negativo." }),
  status: z.enum(["Ativo", "Inativo"]),
});

export default function NewProductPage() {
  const [isPending, startTransition] = React.useTransition();
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEdit = !!productId;

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      description: "",
      costPrice: "R$ 0,00",
      price: "R$ 0,00",
      stock: 0,
      status: "Ativo",
    },
  });

  React.useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            form.reset({
              name: data.data.name,
              description: data.data.description || "",
              costPrice: CurrencyUtils.formatBRL(data.data.cost_price),
              price: CurrencyUtils.formatBRL(data.data.sell_price),
              stock: data.data.inventory || 0,
              status: data.data.status === false || data.data.status === 0 || data.data.status === "Inativo" ? "Inativo" : "Ativo",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro",
              description: data.error || "Erro ao carregar produto.",
            });
          }
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao conectar ao servidor.",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, productId, form, toast]);

  const onSubmit = (values: z.infer<typeof ProductSchema>) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          isEdit ? `/api/products/${productId}` : "/api/products",
          {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              inventory: values.stock,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          toast({
            title: isEdit ? "Produto Atualizado!" : "Produto Adicionado!",
            description: `${values.name} foi ${isEdit ? "atualizado" : "adicionado"} com sucesso.`,
          });
          router.push("/dashboard/products");
          router.refresh();
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: data.error || `Erro ao ${isEdit ? "atualizar" : "salvar"} o produto.`,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao conectar ao servidor.",
        });
      }
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboard/products">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {isEdit ? "Editar Produto" : "Adicionar Novo Produto"}
        </h1>
      </div>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
          <CardDescription>
            {isEdit ? "Atualize os detalhes do produto abaixo." : "Preencha os detalhes abaixo para adicionar um novo produto."}
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
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Notebook Pro"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o produto em poucas palavras..."
                        className="resize-none"
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
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="R$ 0,00"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => field.onChange(CurrencyUtils.formatBRL(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="R$ 0,00"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => field.onChange(CurrencyUtils.formatBRL(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          disabled={isPending}
                          step="1"
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
                            <SelectValue placeholder="Selecione o status do produto" />
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
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/products">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending || loading}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEdit ? "Atualizar Produto" : "Salvar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
