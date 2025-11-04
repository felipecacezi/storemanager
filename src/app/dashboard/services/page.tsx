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

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  status: 'Ativo' | 'Inativo';
};

const initialServices: Service[] = [
  {
    id: 1,
    name: 'Consultoria de Marketing Digital',
    description: 'Análise completa e plano estratégico para redes sociais.',
    price: 1500.00,
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Desenvolvimento de Website',
    description: 'Criação de site institucional responsivo com até 5 páginas.',
    price: 3500.00,
    status: 'Ativo',
  },
   {
    id: 3,
    name: 'Manutenção Mensal de Servidor',
    description: 'Monitoramento, backup e atualizações de segurança.',
    price: 500.00,
    status: 'Inativo',
  },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
};


export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [serviceToInactivate, setServiceToInactivate] = useState<Service | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleInactivateClick = (service: Service) => {
    setServiceToInactivate(service);
    setIsAlertOpen(true);
  };

  const handleInactivateConfirm = () => {
    if (serviceToInactivate) {
      setServices(services.map(s => 
        s.id === serviceToInactivate.id ? { ...s, status: 'Inativo' } : s
      ));
    }
    setIsAlertOpen(false);
    setServiceToInactivate(null);
  };

  const filteredServices = (status: 'Ativo' | 'Inativo' | 'all') => {
    if (status === 'all') return services;
    return services.filter(service => service.status === status);
  }

  const renderServiceRows = (serviceList: Service[]) => {
    return serviceList.map((service) => (
       <TableRow key={service.id}>
        <TableCell className="font-medium">
          {service.name}
          <div className="text-xs text-muted-foreground">{service.description}</div>
        </TableCell>
        <TableCell>{formatPrice(service.price)}</TableCell>
        <TableCell>
          <Badge variant={service.status === 'Ativo' ? 'outline' : 'destructive'}>{service.status}</Badge>
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
                onClick={() => handleInactivateClick(service)}
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
                <Link href="/dashboard/services/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Adicionar Serviço
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
                <CardDescription>
                  Gerencie os serviços oferecidos pela sua empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderServiceRows(services)}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>1-{services.length}</strong> de <strong>{services.length}</strong> serviços
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="active">
             <Card>
              <CardHeader>
                <CardTitle>Serviços Ativos</CardTitle>
                <CardDescription>
                  Lista de todos os serviços com status ativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderServiceRows(filteredServices('Ativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredServices('Ativo').length}</strong> serviços ativos.
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
           <TabsContent value="inactive">
             <Card>
              <CardHeader>
                <CardTitle>Serviços Inativos</CardTitle>
                <CardDescription>
                  Lista de todos os serviços com status inativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderServiceRows(filteredServices('Inativo'))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                 <div className="text-xs text-muted-foreground">
                  Mostrando <strong>{filteredServices('Inativo').length}</strong> serviços inativos.
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
            Esta ação irá inativar o serviço{' '}
            <span className="font-semibold">{serviceToInactivate?.name}</span>. 
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
