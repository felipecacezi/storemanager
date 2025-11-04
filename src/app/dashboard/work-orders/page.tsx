
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

type WorkOrder = {
  id: number;
  clientName: string;
  description: string;
  total: number;
  createdAt: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluída' | 'Cancelada';
};

const initialWorkOrders: WorkOrder[] = [
  {
    id: 1,
    clientName: 'Liam Johnson',
    description: 'Manutenção de computador e formatação',
    total: 350.00,
    createdAt: '2024-07-28',
    status: 'Concluída',
  },
  {
    id: 2,
    clientName: 'Olivia Smith',
    description: 'Desenvolvimento de novo módulo para o sistema',
    total: 2500.00,
    createdAt: '2024-07-25',
    status: 'Em Andamento',
  },
   {
    id: 3,
    clientName: 'Noah Williams',
    description: 'Troca de tela de notebook',
    total: 850.00,
    createdAt: '2024-07-29',
    status: 'Pendente',
  },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}

export default function WorkOrdersPage() {
  const [workOrders] = useState<WorkOrder[]>(initialWorkOrders);

  const getStatusVariant = (status: WorkOrder['status']) => {
    switch (status) {
      case 'Concluída':
        return 'default';
      case 'Em Andamento':
        return 'secondary';
      case 'Pendente':
        return 'outline';
      case 'Cancelada':
        return 'destructive';
      default:
        return 'default';
    }
  }

  const renderWorkOrderRows = (orderList: WorkOrder[]) => {
    return orderList.map((order) => (
       <TableRow key={order.id}>
        <TableCell className="font-medium">#{order.id}</TableCell>
        <TableCell>{order.clientName}</TableCell>
        <TableCell>
            <div className="font-medium">{order.description}</div>
        </TableCell>
        <TableCell>{formatPrice(order.total)}</TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
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
              <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
              >
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
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
                  <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>Pendente</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Em Andamento</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Concluída</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Cancelada</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Exportar
                </span>
              </Button>
              <Button asChild size="sm" className="h-8 gap-1">
                <Link href="/dashboard/work-orders/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Nova O.S.
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Ordens de Serviço</CardTitle>
                <CardDescription>
                  Gerencie todas as ordens de serviço da sua empresa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>O.S.</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {renderWorkOrderRows(workOrders)}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Mostrando <strong>1-{workOrders.length}</strong> de <strong>{workOrders.length}</strong> ordens de serviço
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          {/* Outras abas (TabsContent) podem ser adicionadas aqui para filtrar por status */}
        </Tabs>
      </main>
    </div>
  );
}
