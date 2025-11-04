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

type Product = {
  id: number;
  name: string;
  description: string;
  costPrice: number;
  price: number;
  stock: number;
  status: 'Ativo' | 'Inativo';
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Notebook Pro',
    description: 'Notebook de alta performance para profissionais.',
    costPrice: 5000.00,
    price: 7500.00,
    stock: 15,
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Mouse Sem Fio',
    description: 'Mouse ergonômico com conexão bluetooth.',
    costPrice: 80.00,
    price: 150.00,
    stock: 120,
    status: 'Ativo',
  },
   {
    id: 3,
    name: 'Teclado Mecânico',
    description: 'Teclado com switches blue para gamers e desenvolvedores.',
    costPrice: 300.00,
    price: 450.00,
    stock: 0,
    status: 'Inativo',
  },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
};


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productToInactivate, setProductToInactivate] = useState<Product | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleInactivateClick = (product: Product) => {
    setProductToInactivate(product);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = () => {
    if (productToInactivate) {
      setProducts(products.map(p => 
        p.id === productToInactivate.id ? { ...p, status: 'Inativo' } : p
      ));
    }
    setIsAlertOpen(false);
    setProductToInactivate(null);
  };

  const filteredProducts = (status: 'Ativo' | 'Inativo' | 'all') => {
    if (status === 'all') return products;
    return products.filter(product => product.status === status);
  }

  const renderProductRows = (productList: Product[]) => {
    return productList.map((product) => (
       <TableRow key={product.id}>
        <TableCell className="font-medium">
          {product.name}
          <div className="text-xs text-muted-foreground">{product.description}</div>
        </TableCell>
        <TableCell>{formatPrice(product.costPrice)}</TableCell>
        <TableCell>{formatPrice(product.price)}</TableCell>
        <TableCell>{product.stock}</TableCell>
        <TableCell>
          <Badge variant={product.status === 'Ativo' ? 'outline' : 'destructive'}>{product.status}</Badge>
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
              <DropdownMenuItem>Editar</DropdownMenuItem>
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
    ))
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
                     {renderProductRows(products)}
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
                     {renderProductRows(filteredProducts('Ativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredProducts('Ativo').length}</strong> produtos ativos.
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
                     {renderProductRows(filteredProducts('Inativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                 <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredProducts('Inativo').length}</strong> produtos inativos.
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
