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

type Client = {
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

const initialClients: Client[] = [
  {
    id: 1,
    name: 'Liam Johnson',
    contact: {
      phone: '(11) 98877-6655',
      isWhatsapp: true,
      email: 'liam@example.com',
    },
    cnpjCpf: '12.345.678/0001-99',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Olivia Smith',
    contact: {
      phone: '(11) 98877-6655',
      isWhatsapp: false,
      email: 'olivia@example.com',
    },
    cnpjCpf: '123.456.789-00',
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Noah Williams',
    contact: {
      phone: '(11) 98877-6655',
      isWhatsapp: true,
      email: 'noah@example.com',
    },
    cnpjCpf: '98.765.432/0001-11',
    status: 'Inativo',
  },
];


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientToInactivate, setClientToInactivate] = useState<Client | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleInactivateClick = (client: Client) => {
    setClientToInactivate(client);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = () => {
    if (clientToInactivate) {
      setClients(clients.map(c => 
        c.id === clientToInactivate.id ? { ...c, status: 'Inativo' } : c
      ));
    }
    setIsAlertOpen(false);
    setClientToInactivate(null);
  };

  const filteredClients = (status: 'Ativo' | 'Inativo' | 'all') => {
    if (status === 'all') return clients;
    return clients.filter(client => client.status === status);
  }

  const renderClientRows = (clientList: Client[]) => {
    return clientList.map((client) => (
       <TableRow key={client.id}>
        <TableCell className="font-medium">
          {client.name}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {client.contact.phone}
            {client.contact.isWhatsapp && <MessageCircle className="h-4 w-4 text-green-500" />}
          </div>
          <div className="text-xs text-muted-foreground">{client.contact.email}</div>
        </TableCell>
        <TableCell>{client.cnpjCpf}</TableCell>
        <TableCell>
          <Badge variant={client.status === 'Ativo' ? 'outline' : 'destructive'}>{client.status}</Badge>
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
                onClick={() => handleInactivateClick(client)}
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
                     {renderClientRows(clients)}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>1-{clients.length}</strong> de <strong>{clients.length}</strong> clientes
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
                     {renderClientRows(filteredClients('Ativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredClients('Ativo').length}</strong> clientes ativos.
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
                     {renderClientRows(filteredClients('Inativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                 <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredClients('Inativo').length}</strong> clientes inativos.
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
