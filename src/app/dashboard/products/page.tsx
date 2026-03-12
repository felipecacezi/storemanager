'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useToast } from '@/hooks/use-toast';

type Product = {
  id: number;
  name: string;
  description: string;
  cost_price: number;
  sell_price: number;
  inventory: number;
  status: boolean | number | 'Ativo' | 'Inativo';
};

const initialProducts: Product[] = [];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productToInactivate, setProductToInactivate] = useState<Product | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: data.error || 'Erro ao carregar produtos.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao conectar ao servidor.',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  const handleInactivateClick = (product: Product) => {
    setProductToInactivate(product);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = async () => {
    if (!productToInactivate) return;

    try {
      const response = await fetch(`/api/products/${productToInactivate.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Produto removido!',
          description: data.message || 'O produto foi inativado com sucesso.',
        });
        loadProducts();
      } else {
        throw new Error(data.error || 'Erro ao remover produto.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao remover produto.',
      });
    } finally {
      setIsAlertOpen(false);
      setProductToInactivate(null);
    }
  };

  const isInactive = (product: Product) =>
    product.status === false ||
    product.status === 0 ||
    product.status === 'Inativo';

  const filteredProducts = (tab: 'all' | 'active' | 'inactive') => {
    if (tab === 'all') return products;
    if (tab === 'active') return products.filter(product => !isInactive(product));
    return products.filter(product => isInactive(product));
  }

  const renderProductRows = (productList: Product[]) => {
    return productList.map((product) => {
      const statusLabel = isInactive(product) ? 'Inativo' : 'Ativo';

      return (
        <TableRow key={product.id}>
          <TableCell className="font-medium">
            {product.name}
            <div className="text-xs text-muted-foreground">{product.description}</div>
          </TableCell>
          <TableCell>{formatPrice(product.cost_price)}</TableCell>
          <TableCell>{formatPrice(product.sell_price)}</TableCell>
          <TableCell>{product.inventory}</TableCell>
          <TableCell>
            <Badge variant={statusLabel === 'Ativo' ? 'outline' : 'destructive'}>{statusLabel}</Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-haspopup="true"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/products/new?id=${product.id}`}>
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleInactivateClick(product)}
                  className="text-destructive"
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      )
    })
  }

  const renderTableHeader = () => (
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Preço de Custo</TableHead>
      <TableHead>Preço de Venda</TableHead>
      <TableHead>Estoque</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>
        <span className="sr-only">Ações</span>
      </TableHead>
    </TableRow>
  )

  return (
    <>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtrar
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Ativo
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Inativo</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exportar
                  </span>
                </Button>
                <Button asChild size="sm" className="h-8 gap-1">
                  <Link href="/dashboard/products/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Adicionar Produto
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>
                    Gerencie os produtos do seu estoque.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      {renderTableHeader()}
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            Carregando produtos...
                          </TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            Nenhum produto encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderProductRows(products)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>1-{products.length}</strong> de <strong>{products.length}</strong> produtos
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Ativos</CardTitle>
                  <CardDescription>
                    Lista de todos os produtos com status ativo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      {renderTableHeader()}
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            Carregando produtos...
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts('active').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            Nenhum produto ativo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderProductRows(filteredProducts('active'))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{filteredProducts('active').length}</strong> produtos ativos.
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="inactive">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Inativos</CardTitle>
                  <CardDescription>
                    Lista de todos os produtos com status inativo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      {renderTableHeader()}
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            Carregando produtos...
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts('inactive').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            Nenhum produto inativo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderProductRows(filteredProducts('inactive'))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{filteredProducts('inactive').length}</strong> produtos inativos.
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá inativar o produto{' '}
              <span className="font-semibold">{productToInactivate?.name}</span>.
              Você poderá reativá-lo depois, se necessário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleInactivateConfirm}>
              Sim, inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
