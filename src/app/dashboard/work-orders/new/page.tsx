"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ChevronLeft, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Mock data - in a real app, this would come from your backend
const mockClients = [
  { id: '1', name: 'Liam Johnson' },
  { id: '2', name: 'Olivia Smith' },
  { id: '3', name: 'Noah Williams' },
];

const mockProducts = [
  { id: '1', name: 'Notebook Pro', price: 7500.00, stock: 15 },
  { id: '2', name: 'Mouse Sem Fio', price: 150.00, stock: 120 },
  { id: '3', name: 'Teclado Mecânico', price: 450.00, stock: 0 },
];

const mockServices = [
  { id: '1', name: 'Consultoria de Marketing Digital', price: 1500.00 },
  { id: '2', name: 'Desenvolvimento de Website', price: 3500.00 },
  { id: '3', name: 'Manutenção Mensal de Servidor', price: 500.00 },
];


const WorkOrderSchema = z.object({
  clientId: z.string().min(1, { message: "Selecione um cliente." }),
  description: z.string().optional(),
  status: z.enum(["Pendente", "Em Andamento", "Concluída", "Cancelada"]),
});

export default function NewWorkOrderPage() {
  const [isPending, startTransition] = React.useTransition();
  const [items, setItems] = React.useState<{type: 'product' | 'service', id: string, name: string, quantity: number, price: number}[]>([]);
  const [total, setTotal] = React.useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof WorkOrderSchema>>({
    resolver: zodResolver(WorkOrderSchema),
    defaultValues: {
      clientId: "",
      description: "",
      status: "Pendente",
    },
  });

  React.useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(newTotal);
  }, [items]);

  const addItem = (type: 'product' | 'service', id: string) => {
    const existingItem = items.find(item => item.id === id && item.type === type);
    if (existingItem) {
        setItems(items.map(item => item.id === id && item.type === type ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
        const source = type === 'product' ? mockProducts : mockServices;
        const newItem = source.find(i => i.id === id);
        if (newItem) {
            setItems([...items, { type, id, name: newItem.name, quantity: 1, price: newItem.price }]);
        }
    }
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onSubmit = (values: z.infer<typeof WorkOrderSchema>) => {
    startTransition(async () => {
      // Lógica para salvar a O.S.
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log({ ...values, items, total });

      toast({
        title: "Ordem de Serviço Criada!",
        description: `A O.S. para o cliente selecionado foi criada com sucesso.`,
      });
      router.push("/dashboard/work-orders");
    });
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/work-orders">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Nova Ordem de Serviço
          </h1>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-3 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:col-span-2 md:gap-8">
            <Card>
              <CardHeader>
                  <CardTitle>Detalhes da Ordem de Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockClients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descrição / Defeito Relatado</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Descreva o serviço a ser realizado ou o defeito relatado pelo cliente..."
                            className="resize-none"
                            {...field}
                            disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Itens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={(value) => addItem('service', value)}>
                        <SelectTrigger><SelectValue placeholder="Adicionar Serviço" /></SelectTrigger>
                        <SelectContent>
                            {mockServices.map(service => (
                                <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={(value) => addItem('product', value)}>
                        <SelectTrigger><SelectValue placeholder="Adicionar Produto" /></SelectTrigger>
                        <SelectContent>
                            {mockProducts.filter(p => p.stock > 0).map(product => (
                                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="font-semibold">{formatPrice(item.quantity * item.price)}</p>
                           <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </div>
                      </div>
                    ))}
                     {items.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Nenhum item adicionado.
                        </p>
                    )}
                  </div>
                </div>
              </CardContent>
               <CardFooter className="flex-col items-start space-y-4 border-t pt-6">
                  <div className="flex w-full justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                  </div>
                   <div className="flex w-full justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                  </div>
              </CardFooter>
            </Card>

          </div>
          <div className="grid auto-rows-max items-start gap-4 md:col-span-1 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                           <SelectItem value="Concluída">Concluída</SelectItem>
                           <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/work-orders">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending || items.length === 0}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Ordem de Serviço"}
                </Button>
            </div>
          </div>
        </form>
        </Form>
    </main>
  );
}
