'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  File,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type Client = {
  id: number;
  name: string;
  email: string;
  document: string;
  phone: string;
  is_whatsapp?: boolean | number;
  status?: boolean | number;
};

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [clientToInactivate, setClientToInactivate] = useState<Client | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const loadClients = async (params?: { search?: string }) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(params?.search ? { search: params.search } : {}),
      });

      const response = await fetch(`/api/clients?${query.toString()}`, {
        cache: 'no-store',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao buscar clientes.');
      }

      setClients(Array.isArray(data?.data) ? data.data : []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error?.message || 'Erro ao buscar clientes.',
      });
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const didMountRef = React.useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      loadClients({ search: search.trim() || undefined });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInactive = (client: Client) => client.status === false || client.status === 0;

  const handleInactivateClick = (client: Client) => {
    setClientToInactivate(client);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = async () => {
    if (!clientToInactivate) return;

    try {
      const response = await fetch(`/api/clients/${clientToInactivate.id}`, {
        method: 'DELETE',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao remover cliente.');
      }

      toast({
        title: 'Cliente removido',
        description: data?.message || 'Cliente inativado com sucesso.',
      });

      await loadClients({ search: search.trim() || undefined });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error?.message || 'Erro ao remover cliente.',
      });
    } finally {
      setIsAlertOpen(false);
      setClientToInactivate(null);
    }
  };

  const filteredClients = (tab: 'all' | 'active' | 'inactive') => {
    if (tab === 'all') return clients;
    if (tab === 'active') return clients.filter((c) => !isInactive(c));
    return clients.filter((c) => isInactive(c));
  };

  const renderClientRows = (clientList: Client[]) => {
    return clientList.map((client) => {
      const statusLabel = isInactive(client) ? 'Inativo' : 'Ativo';

      return (
        <TableRow key={client.id}>
          <TableCell className="font-medium">{client.name}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {client.phone}
              {!!client.is_whatsapp && (
                <MessageCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">{client.email}</div>
          </TableCell>
          <TableCell>{client.document}</TableCell>
          <TableCell>
            <Badge variant={statusLabel === 'Ativo' ? 'outline' : 'destructive'}>
              {statusLabel}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/dashboard/clients/new?id=${client.id}`)}
                >
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleInactivateClick(client)}
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

  const allClients = useMemo(() => filteredClients('all'), [clients]);
  const activeClients = useMemo(() => filteredClients('active'), [clients]);
  const inactiveClients = useMemo(() => filteredClients('inactive'), [clients]);

  return (
    <>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>

              <div className="flex flex-1 items-center gap-2 md:ml-auto">
                <Input
                  placeholder="Pesquisar por nome, e-mail, documento ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Exportar
                  </span>
                </Button>

                <Button asChild size="sm" className="h-8 gap-1">
                  <Link href="/dashboard/clients/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Adicionar Cliente
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes</CardTitle>
                  <CardDescription>
                    Gerencie seus clientes e veja seus detalhes de contato.
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
                      ) : allClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum cliente encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderClientRows(allClients)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{allClients.length}</strong> cliente(s)
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Ativos</CardTitle>
                  <CardDescription>
                    Lista de todos os clientes com status ativo.
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
                      ) : activeClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum cliente ativo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderClientRows(activeClients)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{activeClients.length}</strong> cliente(s) ativo(s)
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="inactive">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Inativos</CardTitle>
                  <CardDescription>
                    Lista de todos os clientes com status inativo.
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
                      ) : inactiveClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            Nenhum cliente inativo encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        renderClientRows(inactiveClients)
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Mostrando <strong>{inactiveClients.length}</strong> cliente(s) inativo(s)
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
              Esta ação irá inativar o cliente{' '}
              <span className="font-semibold">{clientToInactivate?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleInactivateConfirm}>
              Sim, inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
