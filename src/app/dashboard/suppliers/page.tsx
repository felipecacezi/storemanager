'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

type Supplier = {
  id: number;
  name: string;
  email: string;
  phone: string;
  is_whatsapp: boolean;
  document: string;
  cnpjCpf?: string; // For compatibility if any
  status?: boolean | number | 'Ativo' | 'Inativo';
};

export default function SuppliersPage() {
  const { toast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [supplierToInactivate, setSupplierToInactivate] = useState<Supplier | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: '1',
        limit: '100',
      });

      const response = await fetch(`/api/vendors?${query.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao buscar fornecedores.');
      }

      setSuppliers(Array.isArray(data?.data) ? data.data : []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error?.message || 'Erro ao buscar fornecedores.',
      });
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInactive = (supplier: Supplier) =>
    supplier.status === false ||
    supplier.status === 0 ||
    supplier.status === 'Inativo';

  const handleInactivateClick = (supplier: Supplier) => {
    setSupplierToInactivate(supplier);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = async () => {
    if (!supplierToInactivate) return;

    try {
      const response = await fetch(`/api/vendors/${supplierToInactivate.id}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao remover fornecedor.');
      }

      toast({
        title: 'Fornecedor removido!',
        description: data?.message || 'O fornecedor foi inativado com sucesso.',
      });

      loadSuppliers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error?.message || 'Erro ao remover fornecedor.',
      });
    } finally {
      setIsAlertOpen(false);
      setSupplierToInactivate(null);
    }
  };

  const filteredSuppliers = (tab: 'all' | 'active' | 'inactive') => {
    if (tab === 'all') return suppliers;
    if (tab === 'active') return suppliers.filter((s) => !isInactive(s));
    return suppliers.filter((s) => isInactive(s));
  };

  const renderSupplierRows = (supplierList: Supplier[]) => {
    return supplierList.map((supplier) => {
      const statusLabel = isInactive(supplier) ? 'Inativo' : 'Ativo';

      return (
        <TableRow key={supplier.id}>
          <TableCell className="font-medium">
            {supplier.name}
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {supplier.phone || 'N/A'}
              {!!supplier.is_whatsapp && <MessageCircle className="h-4 w-4 text-green-500" />}
            </div>
            <div className="text-xs text-muted-foreground">{supplier.email}</div>
          </TableCell>
          <TableCell>{supplier.document || supplier.cnpjCpf}</TableCell>
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
                  <Link href={`/dashboard/suppliers/new?id=${supplier.id}`}>
                    Editar
                  </Link>
                </DropdownMenuItem>
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
      );
    });
  };

  const allSuppliers = useMemo(() => filteredSuppliers('all'), [suppliers]);
  const activeSuppliers = useMemo(() => filteredSuppliers('active'), [suppliers]);
  const inactiveSuppliers = useMemo(() => filteredSuppliers('inactive'), [suppliers]);

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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : allSuppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum fornecedor encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderSupplierRows(allSuppliers)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{allSuppliers.length}</strong> fornecedor(es)
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : activeSuppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum fornecedor ativo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderSupplierRows(activeSuppliers)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{activeSuppliers.length}</strong> fornecedor(es) ativo(s)
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
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : inactiveSuppliers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum fornecedor inativo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderSupplierRows(inactiveSuppliers)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{inactiveSuppliers.length}</strong> fornecedor(es) inativo(s)
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
