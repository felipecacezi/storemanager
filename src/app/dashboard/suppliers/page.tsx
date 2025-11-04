'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  MessageCircle,
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

type Supplier = {
  id: number;
  name: string;
  contact: {
    phone: string;
    isWhatsapp: boolean;
    email: string;
  };
  cnpjCpf: string;
  status: 'Ativo' | 'Inativo';
};

const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: 'Fornecedor Exemplo 1',
    contact: {
      phone: '(21) 99999-8888',
      isWhatsapp: true,
      email: 'contato@fornecedor1.com',
    },
    cnpjCpf: '11.222.333/0001-44',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Fornecedor Exemplo 2',
    contact: {
      phone: '(31) 97777-6666',
      isWhatsapp: false,
      email: 'vendas@fornecedor2.com.br',
    },
    cnpjCpf: '123.456.789-10',
    status: 'Inativo',
  },
];


export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [supplierToInactivate, setSupplierToInactivate] = useState<Supplier | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleInactivateClick = (supplier: Supplier) => {
    setSupplierToInactivate(supplier);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = () => {
    if (supplierToInactivate) {
      setSuppliers(suppliers.map(c => 
        c.id === supplierToInactivate.id ? { ...c, status: 'Inativo' } : c
      ));
    }
    setIsAlertOpen(false);
    setSupplierToInactivate(null);
  };

  const filteredSuppliers = (status: 'Ativo' | 'Inativo' | 'all') => {
    if (status === 'all') return suppliers;
    return suppliers.filter(supplier => supplier.status === status);
  }

  const renderSupplierRows = (supplierList: Supplier[]) => {
    return supplierList.map((supplier) => (
       <TableRow key={supplier.id}>
        <TableCell className="font-medium">
          {supplier.name}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {supplier.contact.phone}
            {supplier.contact.isWhatsapp && <MessageCircle className="h-4 w-4 text-green-500" />}
          </div>
          <div className="text-xs text-muted-foreground">{supplier.contact.email}</div>
        </TableCell>
        <TableCell>{supplier.cnpjCpf}</TableCell>
        <TableCell>
          <Badge variant={supplier.status === 'Ativo' ? 'outline' : 'destructive'}>{supplier.status}</Badge>
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
                onClick={() => handleInactivateClick(supplier)}
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
                <Link href="/dashboard/suppliers/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Adicionar Fornecedor
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Fornecedores</CardTitle>
                <CardDescription>
                  Gerencie seus fornecedores e veja seus detalhes de contato.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderSupplierRows(suppliers)}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>1-{suppliers.length}</strong> de <strong>{suppliers.length}</strong> fornecedores
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="active">
             <Card>
              <CardHeader>
                <CardTitle>Fornecedores Ativos</CardTitle>
                <CardDescription>
                  Lista de todos os fornecedores com status ativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderSupplierRows(filteredSuppliers('Ativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredSuppliers('Ativo').length}</strong> fornecedores ativos.
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="inactive">
             <Card>
              <CardHeader>
                <CardTitle>Fornecedores Inativos</CardTitle>
                <CardDescription>
                  Lista de todos os fornecedores com status inativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>CNPJ/CPF</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderSupplierRows(filteredSuppliers('Inativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                 <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredSuppliers('Inativo').length}</strong> fornecedores inativos.
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
            Esta ação irá inativar o fornecedor{' '}
            <span className="font-semibold">{supplierToInactivate?.name}</span>. 
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
