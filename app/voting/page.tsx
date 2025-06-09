"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  Search,
  Plus,
  ArrowUpDown,
  Calendar,
  Users,
  Vote,
  Building,
  Settings,
  LogOut,
  LineChart,
  Edit,
  Trash2,
  GalleryThumbnails,
  Power,
  PowerOff,
  MonitorCheck,
} from "lucide-react";
import Link from "next/link";
import {
  getIdentity,
  getIsAuthenticated,
  getStorageUsername,
  getToken,
  prepareAuxVoting,
  socket,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IVoting } from "@/interfaces/IVoting";

// 2. Función para cargar diputados (separa la lógica)
const loadVoting = (setMockVoting: Function, currentPage: number) => {
  socket.emit(
    "list-voting",
    {
      token: getToken(),
      identity: getIdentity(),
      page: currentPage,
    },
    (response: any) => {
      if (response.success) {
        setMockVoting(response.votings);
      } else {
        console.error(response.message);
      }
    }
  );
};

export default function VotingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storageUsername, setStorageUserName] = useState<string | null>("");
  const [isAuthenticated, setIsAuthenticated] = useState<string | null>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVoting, setEditingVoting] = useState<any>(null);
  const [deletingVoting, setDeletingVoting] = useState<any>(null);
  const [mockVoting, setMockVoting] = useState<IVoting[]>([]);
  const [filteredVoting, setFilteredVoting] = useState<IVoting[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [scheduledCount, setScheduledCount] = useState<number>(0);

  useEffect(() => {
    setIsAuthenticated(getIsAuthenticated());
    setStorageUserName(getStorageUsername());

    //loadVoting(setMockVoting, currentPage);
    setCurrentPage(1);
  }, [router]);

  useEffect(() => {
    loadVoting(setMockVoting, currentPage);
  }, [currentPage]);

  useEffect(() => {
    const filtered = prepareFilterVoting();
    setFilteredVoting(filtered);

    // Get counts for stats
    const activeCount = mockVoting.filter((s) => s.result === "Activa").length;
    const completedCount = mockVoting.filter(
      (s) =>
        s.result === "Aprobada" ||
        s.result === "Denegada" ||
        s.result === "Sin Desición"
    ).length;
    const scheduledCount = mockVoting.filter(
      (s) => s.result === "Programada"
    ).length;

    setActiveCount(activeCount);
    setCompletedCount(completedCount);
    setScheduledCount(scheduledCount);
  }, [mockVoting, searchTerm, statusFilter]);

  const handleCreateVoting = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditVoting = (voting: IVoting) => {
    setEditingVoting(voting);
    setIsEditDialogOpen(true);
  };

  const handleDeleteVoting = (voting: IVoting) => {
    setDeletingVoting(voting);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveVoting = () => {
    // Aquí iría la lógica para guardar la votación
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingVoting(null);
  };

  const handleConfirmDelete = () => {
    // Aquí iría la lógica para eliminar la votación
    setIsDeleteDialogOpen(false);
    setDeletingVoting(null);
  };

  const handleSwitchVoting = (id: number) => {
    //Logica para Abrir o Cerrar una votación
    socket.emit(
      "change-status-voting",
      { identity: getIdentity(), token: getToken(), id },
      (res: any) => {
        if (res.success) {
          loadVoting(setMockVoting, currentPage);
        } else {
          console.error(res.message);
        }
      }
    );
  };

  // Filter voting sessions based on search term and status

  const prepareFilterVoting = () => {
    return mockVoting?.filter((voting) => {
      const matchesSearch =
        voting.voting_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voting.commission_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        voting.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && voting.state === statusFilter;
    });
  };

  const navigationTabs = [
    { id: "users", label: "Gestionar Usuario", icon: Users, href: "/users" },
    {
      id: "editions",
      label: "Gestionar Edición",
      icon: Calendar,
      href: "/editions",
    },
    {
      id: "commissions",
      label: "Gestionar Comisiones",
      icon: Building,
      href: "/commissions",
    },
    {
      id: "voting",
      label: "Gestionar Votaciones",
      icon: Vote,
      href: "/voting",
      active: true,
    },
    { id: "roles", label: "Gestionar Roles", icon: Settings, href: "/roles" },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Activa":
      case "Aprobada":
      case "Abierta":
        return "bg-green-100 text-green-800";
      case "Sin Desición":
        return "bg-gray-100 text-gray-800";
      case "Programada":
        return "bg-blue-100 text-blue-800";
      case "Denegada":
      case "Cerrada":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">XIII</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Modelo de Naciones Unidas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                Bienvenido, {storageUsername || "Usuario"}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navigationTabs.map((tab) => (
              <Link key={tab.id} href={tab.href || "#"}>
                <button
                  className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 ${
                    tab.active
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestionar Votaciones</h1>
            <p className="text-gray-500">
              Administre las sesiones de votación del sistema
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateVoting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Votación
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Votaciones Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Vote className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-2xl font-bold">{activeCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Votaciones Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Check className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{completedCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Votaciones Programadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-orange-600 mr-2" />
                <span className="text-2xl font-bold">{scheduledCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Votaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar votaciones..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los resultados</SelectItem>
                  <SelectItem value="Activa">Activas</SelectItem>
                  <SelectItem value="Aprobada">Aprobadas</SelectItem>
                  <SelectItem value="Denegada">Denegadas</SelectItem>
                  <SelectItem value="Sin Desición">Sin Desición</SelectItem>
                  <SelectItem value="Programada">Programadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[350px]">
                      <div className="flex items-center">
                        Título
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resutado</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Participantes
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!filteredVoting || filteredVoting.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No se encontraron votaciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVoting.map((voting) => (
                      <TableRow key={voting.id_voting}>
                        <TableCell className="font-medium">
                          {voting.voting_name}
                        </TableCell>
                        <TableCell>{voting.commission_name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              voting.state
                            )}`}
                          >
                            {voting.state}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                              voting.result
                            )}`}
                          >
                            {voting.result}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{voting.totalParticipants}</span>
                            {voting.totalVotes > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({voting.totalVotes} votos)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                voting.result === "Aprobada" ||
                                voting.result === "Denegada" ||
                                voting.result === "Sin Desición"
                                  ? "hidden"
                                  : ""
                              }
                              onClick={() =>
                                handleSwitchVoting(voting.id_voting)
                              }
                            >
                              {voting.state === "Abierta" ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>

                            <Link
                              href={`${
                                voting.state === "Abierta"
                                  ? `/voting/${voting.id_voting}`
                                  : `/voting/${voting.id_voting}/monitor`
                              }`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={
                                  voting.state === "Cerrada" ? "hidden" : ""
                                }
                                onClick={() => {
                                  prepareAuxVoting(voting);
                                }}
                              >
                                <Vote className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/voting/${voting.id_voting}/monitor`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 hover:bg-gray-50"
                                onClick={() => {
                                  prepareAuxVoting(voting);
                                }}
                              >
                                <MonitorCheck className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVoting(voting)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteVoting(voting)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Modal Crear/Editar Votación */}
          <Dialog
            open={isCreateDialogOpen || isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingVoting(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingVoting ? "Editar Votación" : "Crear Nueva Votación"}
                </DialogTitle>
                <DialogDescription>
                  {editingVoting
                    ? "Modifique los datos de la votación."
                    : "Complete los datos para crear una nueva votación."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="title"
                    defaultValue={editingVoting?.title || ""}
                    className="col-span-3"
                    placeholder="Título de la votación"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    defaultValue={editingVoting?.description || ""}
                    className="col-span-3"
                    placeholder="Descripción detallada..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="commission" className="text-right">
                    Comisión
                  </Label>
                  <Select defaultValue={editingVoting?.commission || ""}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar comisión" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salud">Comisión de Salud</SelectItem>
                      <SelectItem value="educacion">
                        Comisión de Educación
                      </SelectItem>
                      <SelectItem value="economia">
                        Comisión de Economía
                      </SelectItem>
                      <SelectItem value="cultura">
                        Comisión de Cultura
                      </SelectItem>
                      <SelectItem value="ciencia">
                        Comisión de Ciencia y Tecnología
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">
                    Fecha Límite
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    defaultValue={editingVoting?.deadline || ""}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingVoting(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveVoting}>
                  {editingVoting ? "Guardar Cambios" : "Crear Votación"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Eliminar Votación */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Eliminar Votación</DialogTitle>
                <DialogDescription>
                  ¿Está seguro que desea eliminar la votación "
                  {deletingVoting?.title}"? Esta acción no se puede deshacer y
                  se perderán todos los votos registrados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleConfirmDelete}>
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  );
}
